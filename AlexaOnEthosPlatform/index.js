/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk');
const rp = require('request-promise');
const AWS  = require('aws-sdk');
// Use bluebird implementation of Promise
AWS.config.setPromisesDependency(require('bluebird'));
const ssm  = new AWS.SSM();
const fuzz = require('fuzzball');

// The API key of the application we will call Ethos Integration with
// You may need to create a new application in Ethos Integration, with credentials that 
// allow it to call the APIs of the applications that will serve the data, e.g. Colleague/Banner/etc.
const ethosAPIKey = '<get your key from your application in Ethos Integration dashboard>';
const ethosURIBase = 'https://integrate.elluciancloud.com';

// The names of the AWS 'Systems Manager - Parameter Store' parameters we want to use for user validation
const ParamBannerID = 'EthosDemoBannerID';
const ParamBannerName = 'EthosDemoPersonName';
var configuredBannerID;
var configuredBannerName;
var configuredBannerPersonGUID;
var configValidated = false;
var ethosBearerToken = null;
var ethosTokenExpired = true;
var retryCounter = 0;
// The number of API call retries we should attempt before giving up.
var retryLimit = 2;

async function isSkillConfigured()
{
    if(configValidated) return true;
    
    let params = {
        Names: [ 
            ParamBannerID,
            ParamBannerName
        ],
        WithDecryption: false
    };
	
    const retrievedParams = await ssm.getParameters(params).promise()
		.catch(error => console.error('Could not retrieve params from AWS Systems Manager Parameter Store, because: ' + error.message));
    
	console.log('Retrieved params: ' + retrievedParams);
	console.log('Parameters: ' + retrievedParams.Parameters);
			
	for(var i=0; i<retrievedParams.Parameters.length; i++) {
		var param = retrievedParams.Parameters[i];
		console.log('Param is: ' + param.Name + ':' + param.Value);
		if(param.Name && param.Name==ParamBannerID) {
			if(!param.Value || param.Value == ' '){
				console.log('Could not find value for param ' + ParamBannerID);
				return false;
			} 
			else {
				configuredBannerID = param.Value
			}
		}
		else if(param.Name && param.Name==ParamBannerName) {
			if(!param.Value  || param.Value == ' '){
				console.log('Could not find value for param ' + ParamBannerName);
				return false;
			} 
			else {
				configuredBannerName = param.Value
			}
		}
		else {
			console.log('Got back a superfluous param named ' + param.Name + ' with a value of ' + param.Value);
		}
	}
	
	// Check if the parameters we've retrieved validate successfully
	if(await validateConfig()){
		configValidated = true;
		return true;
	}
	else {
		configValidated = false;
		return false;
	}
};

async function validateConfig(){
	console.log('entering validateConfig()');
	
	const personDetails = await getPersonDetails();
	let PersonAPIName;
	
	console.log('The getPersonDetails response looks like ' + personDetails + '; its type is ' + typeof(personDetails));		
	try{
		// Process the returned payload from Ethos API and extract the person's name to answer the question
		PersonAPIName = personDetails[0].names[0].fullName;
		configuredBannerPersonGUID = personDetails[0].id;
	}
	catch(error){console.error('Could not find a fullName attribute in the response from PersonDetails API because ' + error.message)};
	
	const fuzz_ratio = fuzz.token_set_ratio(configuredBannerName.toLowerCase(), PersonAPIName.toLowerCase());
	console.log('Comparing the configured name of ' + configuredBannerName + ' and the name returned from Banner (' + PersonAPIName + ') and got a match of ' + fuzz_ratio + '%');
	return fuzz_ratio>85;
};

async function getEthosBearerToken(){
    let    responseToken;
    
    // Call the REST service
    console.log('Getting the Ethos Authorisation token request');
    let options = {
		method: 'POST',
        uri: ethosURIBase + '/auth', 
        headers: {	'Authorization':'Bearer ' + ethosAPIKey},
		json : true
    };
    
    responseToken = await rp(options)
		.catch(error=>console.error('Could not retrieve Ethos Authorisation Token, due to: ' + error.message));

	// Set the cached value, so we don't need to retrieve it so many times.
	ethosBearerToken = responseToken;
	ethosTokenExpired = false;
	
	return responseToken;
};

async function getPersonDetails(){
    let    responseJsonBody;
    
	// Make sure we have an Ethos Authorisation Token
	if (ethosBearerToken == null || ethosTokenExpired) {
		await getEthosBearerToken();
	}
	
    // Call the REST service
    console.log('Getting the Person request for Banner ID: ' + configuredBannerID);
    let options = {
        uri: ethosURIBase + '/api/persons?criteria={"credentials":[{"type":"bannerId","value":"' + configuredBannerID + '"}]}', 
        headers: {	'Accept':'application/vnd.hedtech.integration.v12+json',
					'Authorization':'Bearer ' + ethosBearerToken},
		json : true
    };
    
    responseJsonBody = await rp(options)
		.catch(error=> {
			// If we get a 401 error, then the token must be expired
			if (error.statusCode == "401" && retryCounter < retryLimit) {
				ethosTokenExpired=true;
				retryCounter++;
				return this.getPersonDetails;
			}
			console.error('Could not retrieve information from Person API due to ' + error.message)
		});
	
	// When successful, reset the retry counter.
	retryCounter = 0;
	
	return responseJsonBody;
};

async function getBalance(){
    let    responseJsonBody;
    
	// Make sure we have an Ethos Authorisation Token
	if (ethosBearerToken == null || ethosTokenExpired) {
		await getEthosBearerToken();
	}
    
    // Call the REST service
    console.log('Getting the Account Balance request');
    let options = {
        uri: ethosURIBase + '/api/student-charges?student=' + configuredBannerPersonGUID,
        headers: {	'Accept':'application/vnd.hedtech.integration.v6+json',
					'Authorization':'Bearer ' + ethosBearerToken},
		json : true
    };
    
    responseJsonBody = await rp(options)
		.catch(error=> {
			console.error('Could not retrieve information from Account Balance API due to ' + error.message);
			
			// If we get a 401 error, then the token must be expired, we should retry
			if (error.statusCode == "401" && retryCounter < retryLimit) {
				console.error('The token has expired');
				ethosTokenExpired=true;
				retryCounter++;
				return this.getBalance;
			}
		});
	
	// When successful, reset the retry counter.
	retryCounter = 0;

	return responseJsonBody;
};

async function getSectionRegistrationsDetails(){
    let    responseJsonBody;
    
	// Make sure we have an Ethos Authorisation Token
	if (ethosBearerToken == null || ethosTokenExpired) {
		await getEthosBearerToken();
	}

    // Call the REST service
    console.log('Getting the Section Registration request');
    let options = {
		uri: ethosURIBase + '/api/section-registrations?registrant=' + configuredBannerPersonGUID,
        headers: {	'Accept':'application/vnd.hedtech.integration.v7+json',
					'Authorization':'Bearer ' + ethosBearerToken},
		json : true
    };
    
    responseJsonBody = await rp(options)
		.catch(error=> {
			console.error('Could not retrieve information from Section Registrations API due to ' + error.message);
			
			// If we get a 401 error, then the token must be expired, we should retry
			if (error.statusCode == "401" && retryCounter < retryLimit) {
				console.error('The token has expired');
				ethosTokenExpired=true;
				retryCounter++;
				return this.getSectionRegistrationsDetails;
			}
		});
	
	// When successful, reset the retry counter.
	retryCounter = 0;

	return responseJsonBody;
};

async function getSectionDetails(sectionGUID){
    let    responseJsonBody;
    
	// Make sure we have an Ethos Authorisation Token
	if (ethosBearerToken == null || ethosTokenExpired) {
		await getEthosBearerToken();
	}
	
    // Call the REST service
    console.log('Getting the Section request for ' + sectionGUID);
    let options = {
		uri: ethosURIBase + '/api/sections/' + sectionGUID,
        headers: {	'Accept':'application/vnd.hedtech.integration.v16.0.0+json',
					'Authorization':'Bearer ' + ethosBearerToken},
		json : true
    };
    
    responseJsonBody = await rp(options)
		.catch(error=> {
			console.error('Could not retrieve information from from Sections API due to ' + error.message);
			
			// If we get a 401 error, then the token must be expired, we should retry
			if (error.statusCode == "401" && retryCounter < retryLimit) {
				console.error('The token has expired');
				ethosTokenExpired=true;
				retryCounter++;
				return this.getSectionRegistrationsDetails;
			}
		});
	
	// When successful, reset the retry counter.
	retryCounter = 0;

	return responseJsonBody;
};

async function getGradeDefinitionsDetails(gradeGUID){
    let    responseJsonBody;
    
	// Make sure we have an Ethos Authorisation Token
	if (ethosBearerToken == null || ethosTokenExpired) {
		await getEthosBearerToken();
	}

    // Call the REST service
    console.log('Getting the Grade Definitions request for ' + gradeGUID);
    let options = {
		uri: ethosURIBase + '/api/grade-definitions/' + gradeGUID,
        headers: {	'Authorization':'Bearer ' + ethosBearerToken},
		json : true
    };
    
    responseJsonBody = await rp(options)
		.catch(error=> {
			console.error('Could not retrieve information from from Grade Definitions API due to ' + error.message);
			
			// If we get a 401 error, then the token must be expired, we should retry
			if (error.statusCode == "401" && retryCounter < retryLimit) {
				console.error('The token has expired');
				ethosTokenExpired=true;
				retryCounter++;
				return this.getSectionRegistrationsDetails;
			}
		});
	
	// When successful, reset the retry counter.
	retryCounter = 0;

	return responseJsonBody;
};

async function getGPA(){
	let    responseJsonBody;

	// Make sure we have an Ethos Authorisation Token
	if (ethosBearerToken == null || ethosTokenExpired) {
		await getEthosBearerToken();
	}
    
    // Call the REST service
    console.log('Getting the GPA request');
    let options = {
        uri: ethosURIBase + '/api/student-grade-point-averages?criteria={"student":{"id":"' + configuredBannerPersonGUID +'"}}',
        headers: {	'Accept':'application/vnd.hedtech.integration.v1.0.0+json',
					'Authorization':'Bearer ' + ethosBearerToken},
		json : true
    };
	console.log('GPA URI is ' + options.uri);
	
	responseJsonBody = await rp(options)
		.catch(error=>{
			console.error('Could not retrieve information from from GPA API due to ' + error.message);
			
			// If we get a 401 error, then the token must be expired, we should retry
			if (error.statusCode == "401" && retryCounter < retryLimit) {
				console.error('The token has expired');
				ethosTokenExpired=true;
				retryCounter++;
				return this.getSectionRegistrationsDetails;
			}
		});
	
	// When successful, reset the retry counter.
	retryCounter = 0;

	return responseJsonBody;
}


const EthosHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    console.log('Entering LaunchRequest');
	var speechOutput;
	var repromptOutput;
	
    if(await isSkillConfigured()){
		console.log('The skill seems to be correctly configured and validated');
        speechOutput = ETHOS_INTRO_MESSAGE + ETHOS_REPROMPT + ETHOS_EXAMPLE_PROMPT;
        repromptOutput = ETHOS_REPROMPT;
    }
    else {
		console.log('The skill does not seem to be correctly configured (or validated), let\'s get the user to reconfigure');
        speechOutput = ETHOS_INTRO_MESSAGE + CONFIG_PROMPT1;
        repromptOutput = CONFIG_REPROMPT1;
    }

    console.log('Speech output will be ' + speechOutput);
    console.log('Reprompt output will be ' + repromptOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const AttendanceHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetAttendance';
  },
  handle(handlerInput) {
    console.log('Entering GetAttendance');
    const speechOutput = ATTENDANCE_MESSAGE;

    console.log('Speech output will be ' + speechOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(ANYTHING_ELSE)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .getResponse();
  },
};

const GPAHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetGPA';
    },
    async handle(handlerInput) {
        console.log('Entering GetGPA');
        let speechOutput = NOGPA_MESSAGE;
		
        let gpaResponse = await getGPA()
			.catch(error=>console.error('Could not retrieve information from GPA API due to ' + error.message));;

        if(gpaResponse){
			console.log('The GPA response is: ' + gpaResponse);
			
			// Process the returned payload from Ethos API and extract the GPA to answer the question
			const GPA = gpaResponse[0].cumulative[0].value;
			if(GPA) {
				// If all goes well, we want to call the resolve function to set the value returned by the async call.
				speechOutput = GPA_MESSAGE + parseFloat(GPA).toFixed(2);
			}
		}
		
        return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(ANYTHING_ELSE)
                        .withSimpleCard(SKILL_NAME, speechOutput)
                        .getResponse();
    },
};

const BalanceHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetBalance';
    },
    async handle(handlerInput) {
        console.log('Entering GetBalance');
		const request = handlerInput.requestEnvelope.request;
        let speechOutput = NO_BALANCE_RESPONSE;
		let balanceTotal = 0;
		
		let response = await getBalance()
		    .catch(error=>console.error('Could not retrieve information from Balance API due to ' + error.message));

		if(response) {
			for(let i=0; i<response.length; i++){
				balanceTotal += response[i].chargedAmount.amount.value;
			}
			
		    speechOutput = BALANCE_RESPONSE + balanceTotal.toFixed(0) + ' ';
			
			// We're assuming here that the locale implies the currency being used.
			// If your institution uses multiple currencies, then you need to look at the 
			// response from the API above to get the total for each currency and return that.
			switch(request.locale){
				case 'en-GB': speechOutput += BRITISH_POUNDS;
				              break;
				case 'en-AU': speechOutput += AUSTRALIAN_DOLLARS;
				              break;
				case 'en-US': speechOutput += US_DOLLARS;
			}
	    }

        return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(ANYTHING_ELSE)
                        .withSimpleCard(SKILL_NAME, speechOutput)
                        .getResponse();
    },
};

const GradeHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetGrade';
    },
    async handle(handlerInput) {
        console.log('Entering GetGrade');
        let speechOutput = NO_GRADE_RESPONSE;
		let gotGrade = false;
		const request = handlerInput.requestEnvelope.request;
		const SubjectTitle = (request.intent.slots.SubjectTitle.value ? request.intent.slots.SubjectTitle.value : null);

		provideProgressiveFeedback(handlerInput, "OK. Let me search through your registrations for " +SubjectTitle + ". One moment please.");
			
		console.log('Waiting for promise');
        await getSectionRegistrationsDetails().then(async function(SectionRegResponse) {
			console.log('Got a positive response to promise');
			// The following loop goes through all of the Section Registrations that the student has.
			// It will try to match the title of the Section to the one the user specified.
			for(let i=0; i<SectionRegResponse.length; i++){
				// If one of our loops has already got our desired grade, then stop processing.
				if (gotGrade) { 
					break;
				}
				// Using the ID of the section the student is registered in, retrieve the section details, 
				// so we can get the title out and compare it.
				await getSectionDetails(SectionRegResponse[i].section.id).then(async function(sectionResponse) {
					console.log('The response is ' + sectionResponse);
					console.log('Comparing subject title ' + SubjectTitle + ' to response course ' + sectionResponse.titles[0].value);
					if(fuzz.token_set_ratio(sectionResponse.titles[0].value, SubjectTitle) > 90) {
						console.log('Found a matching course grade instance for ' + sectionResponse.titles[0].value + ' CRN# ' + sectionResponse.code);
						
						await getGradeDefinitionsDetails(SectionRegResponse[i].grades[0].grade.id).then(function(GradeDefResponse) {
							speechOutput = GRADE_RESPONSE + sectionResponse.titles[0].value + ' was ' + GradeDefResponse.grade.value;
							gotGrade = true;
						})
						.catch(error3 => console.log('Got a negative response to Grade Definition promise, with details: ' + error3.message));
					};
				})
				.catch(error2 => console.log('Got a negative response to Section promise, with details: ' + error2.message));
			}
		})
		.catch(error => console.log('Got a negative response to Section Registration promise, with details: ' + error.message));
		
        console.log('Finished waiting for promise.');
		
        return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(ANYTHING_ELSE)
                        .withSimpleCard(SKILL_NAME, speechOutput)
                        .getResponse();
    },
};

const AllGradeHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetAllGrades';
    },
    async handle(handlerInput) {
        console.log('Entering GetAllGrades');
        let speechOutput = NO_GRADES_RESPONSE;
		const request = handlerInput.requestEnvelope.request;

		provideProgressiveFeedback(handlerInput, "OK. Give me a moment to search through the records. One moment please.");
		
		console.log('Waiting for promise');
        await getSectionRegistrationsDetails().then(async function(SectionRegResponse) {
			console.log('The section registration response is ' + JSON.stringify(SectionRegResponse));
			console.log('---END RESPONSE---');
			
			console.log('Got a positive response to promise');
			if (SectionRegResponse.length>0) {
				speechOutput = 'Here are <emphasis level="strong">all</emphasis> ' + SectionRegResponse.length + ' of your grades. ';
				// The following loop goes through all of the Section Registrations that the student has.
				for(let i=0; i<SectionRegResponse.length; i++){
					// Using the ID of the section the student is registered in, retrieve the section details, 
					// so we can get the title and grade from it.
					await getSectionDetails(SectionRegResponse[i].section.id).then(async function(sectionResponse) {
						console.log('The section response is ' + JSON.stringify(sectionResponse));
						console.log('---END RESPONSE---');
						
						speechOutput += sectionResponse.titles[0].value + ', ';			
					})
					.catch(error2 => console.log('Got a negative response to Section promise, with details: ' + error2.message));
					
					// If a grade exists, get it, otherwise output "no grade recorded"
					if (SectionRegResponse[i].grades) {
						await getGradeDefinitionsDetails(SectionRegResponse[i].grades[0].grade.id).then(function(GradeDefResponse) {
							console.log('The grade response is ' + JSON.stringify(GradeDefResponse));
							console.log('---END RESPONSE---');
							
							speechOutput += GradeDefResponse.grade.value + '. ';
						})
						.catch(error3 => console.log('Got a negative response to Grade Definition promise, with details: ' + error3.message));
					}
					else {
						speechOutput += 'No grade achieved. ';
					}
				}
			}
		})
		.catch(error => console.log('Got a negative response to Section Registration promise, with details: ' + error.message));
		
        console.log('Finished waiting for promise.');
		
        return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(ANYTHING_ELSE)
                        .withSimpleCard(SKILL_NAME, speechOutput)
                        .getResponse();
    },
};

const ConfigureHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'ResetConfiguration';
  },
  handle(handlerInput) {
    console.log('Entering ResetConfiguration');
	var speechOutput;
	var repromptOutput;
	
    speechOutput = OK + CONFIG_PROMPT1;
    repromptOutput = CONFIG_REPROMPT1;

    console.log('Speech output will be ' + speechOutput);
    console.log('Reprompt output will be ' + repromptOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const ProvideBannerIDHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'ProvideBannerID';
  },
  async handle(handlerInput) {
    console.log('Entering ProvideBannerID');
	var speechOutput;
	var repromptOutput;
	const request = handlerInput.requestEnvelope.request;
	const BannerID = (request.intent.slots.BannerID.value ? 'A'+request.intent.slots.BannerID.value.padStart(8,0) : null);
	
	if (BannerID){
		configuredBannerID = BannerID;
		
		let params = {
			Name: ParamBannerID, 
			Type: 'String',
			Value: BannerID,
            Description: 'The Banner ID required to access the Person API in the Ethos Demo',
            Overwrite: true
        };
		await ssm.putParameter(params).promise()
			.then(function(result){console.log('Successfully wrote the paramter ' + ParamBannerID + ' with the value ' + BannerID + ' to the SSM store');})
		    .catch(error => console.error('Could not set parameter ' + ParamBannerID + ' in the AWS Systems Manager Parameter Store, because: ' + error.message));
		
		speechOutput = OK + CONFIG_PROMPT2;
        repromptOutput = CONFIG_REPROMPT2;
	}
	else{
		speechOutput = CONFIG_FAIL_ID + CONFIG_REPROMPT1;
		repromptOutput = CONFIG_REPROMPT1;
	}
    
    console.log('Speech output will be ' + speechOutput);
    console.log('Reprompt output will be ' + repromptOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const ProvideNameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'ProvideName';
  },
  async handle(handlerInput) {
    console.log('Entering ProvideName');
	var speechOutput;
	var repromptOutput;
	const request = handlerInput.requestEnvelope.request;
	const PersonName = (request.intent.slots.PersonName.value ? request.intent.slots.PersonName.value : null);
	
	if (PersonName){
		configuredBannerName = PersonName; 
		
		let params = {
			Name: ParamBannerName, 
			Type: 'String',
			Value: PersonName,
            Description: 'The Person Name required to validate the Banner ID specified in the Ethos Demo',
            Overwrite: true
        };
		await ssm.putParameter(params).promise()
			.then(function(result){console.log('Successfully wrote the paramter ' + ParamBannerName + ' with the value ' + PersonName + ' to the SSM store');})
		    .catch(error => console.error('Could not set parameter ' + ParamBannerName + ' in the AWS Systems Manager Parameter Store, because: ' + error.message));
		
		// Now validate that the parameters provided are actually correct.
		if(await validateConfig()){
			configValidated = true;
			speechOutput = CONFIG_SUCCESS + ETHOS_REPROMPT + ETHOS_EXAMPLE_PROMPT;
			repromptOutput = ETHOS_REPROMPT;
		}
		else {
			configValidated = false;
			speechOutput = CONFIG_FAIL + CONFIG_REPROMPT1;
			repromptOutput = CONFIG_REPROMPT1;
		}
	}
	else{
		speechOutput = CONFIG_FAIL_ID + CONFIG_REPROMPT1;
		repromptOutput = CONFIG_REPROMPT1;
	}
    
    console.log('Speech output will be ' + speechOutput);
    console.log('Reprompt output will be ' + repromptOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.HelpIntent' || request.intent.name === 'AMAZON.FallbackIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE + QUESTION2 + QUESTION3 + QUESTION4 +QUESTION_FINAL)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('Session ended with reason: ' + handlerInput.requestEnvelope.request.reason);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('Error handled: ' + error.message);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

function provideProgressiveFeedback(handlerInput, textToSpeak) {
  const { requestEnvelope } = handlerInput
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient()
  
  const directive = {
    header: {
      requestId: requestEnvelope.request.requestId
    },
    directive: {
      type: 'VoicePlayer.Speak',
      speech: textToSpeak
    }
  }
  return directiveServiceClient.enqueue(directive, requestEnvelope.context.System.apiEndpoint, requestEnvelope.context.System.apiAccessToken)
};

const SKILL_NAME = 'Ellucian University';
const ETHOS_INTRO_MESSAGE = 'Welcome to Ellucian University. ';
const ETHOS_REPROMPT = 'You can ask me about your life at the University. ';
const ETHOS_EXAMPLE_PROMPT = 'To get a full list of commands, just say help.';
const ATTENDANCE_MESSAGE = 'Well, we have strong evidence, even visual proof, that you have very recently attended a class on machine learning. However, the Ethos Data Lake is also full of records of absences for other subjects.';
const GPA_MESSAGE = "Your g.p.a. is ";
const NOGPA_MESSAGE = "I can't seem to get your G.P.A. at this time. Can you please try later?";
const ANYTHING_ELSE = 'What else can I help you with today?';
const HELP_MESSAGE = 'You can ask me questions like. ';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Thank you, have a nice day.';
const CONFIG_FAIL_ID = 'I need a valid Banner ID before we can proceed. ';
const CONFIG_PROMPT1 = 'I need to get some of your details before we can proceed. What is your Banner I.D.?';
const CONFIG_REPROMPT1 = 'What is your Banner I.D.?';
const CONFIG_PROMPT2 = 'Now I just need your full name.';
const CONFIG_REPROMPT2 = 'What is your name?';
const CONFIG_SUCCESS = 'Thank you, I have reconfigured this intent for you. ';
const CONFIG_FAIL = 'Hmmm. It seems that the Banner ID you provided does not match your ID. Let\'s try again. '
const OK = 'O.K. ';
const QUESTION2 = 'What is my gpa? ';
const QUESTION3 = 'What was my grade for Computing Foundations? , you can ask this for any other class you have taken. ';
const QUESTION4 = 'Or you can ask, What is my account balance? ';
const QUESTION_FINAL = 'Or, say help at any time to repeat this list. You can also change user by saying, change user.';
const UNDER_CONSTRUCTION = 'Sorry, this intent is still under construction, please try later';
const GRADE_RESPONSE = 'Your grade for ';
const NO_GRADE_RESPONSE = 'I can\'t seem to find the grade for that.';
const NO_GRADES_RESPONSE = 'I can\'t seem to find any grade for you.';
const BALANCE_RESPONSE = 'Your account balance is ';
const NO_BALANCE_RESPONSE = 'I couldn\'t find your account balance at this time ';
const AUSTRALIAN_DOLLARS = 'Australian Dollars';
const BRITISH_POUNDS = 'Pounds';
const US_DOLLARS = 'Dollars';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    EthosHandler,
    AttendanceHandler,
    GPAHandler,
	BalanceHandler,
	GradeHandler,
	AllGradeHandler,
	ConfigureHandler,
	ProvideBannerIDHandler,
	ProvideNameHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
