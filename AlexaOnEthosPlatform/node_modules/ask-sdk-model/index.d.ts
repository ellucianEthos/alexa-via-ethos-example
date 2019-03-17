export declare namespace services {
    /**
     * Represents the interface between ApiClient and a Service Client.
     * @export
     * @interface ApiClientMessage
     */
    interface ApiClientMessage {
        headers: Array<{
            key: string;
            value: string;
        }>;
        body?: string;
    }
    /**
     * Represents a request sent from Service Clients to an ApiClient implementation.
     * @export
     * @interface ApiClientRequest
     * @extends {ApiClientMessage}
     */
    interface ApiClientRequest extends ApiClientMessage {
        url: string;
        method: string;
    }
    /**
     * Represents a response returned by ApiClient implementation to a Service Client.
     * @export
     * @interface ApiClientResponse
     * @extends {ApiClientMessage}
     */
    interface ApiClientResponse extends ApiClientMessage {
        /**
         * Result code of the attempt to satisfy the request. Normally this
         * corresponds to the HTTP status code returned by the server.
         */
        statusCode: number;
    }
    /**
     * Represents a basic contract for API request execution
     * @export
     * @interface ApiClient
     */
    interface ApiClient {
        /**
         * Dispatches a request to an API endpoint described in the request.
         * An ApiClient is expected to resolve the Promise in the case an API returns a non-200 HTTP
         * status code. The responsibility of translating a particular response code to an error lies with the
         * caller to invoke.
         * @param {ApiClientRequest} request request to dispatch to the ApiClient
         * @returns {Promise<ApiClientResponse>} Response from the ApiClient
         * @memberof ApiClient
         */
        invoke(request: ApiClientRequest): Promise<ApiClientResponse>;
    }
    /**
     * Represents an interface that provides API configuration options needed by service clients.
     * @interface ApiConfiguration
     */
    interface ApiConfiguration {
        /**
         * Configured ApiClient implementation
         */
        apiClient: ApiClient;
        /**
         * Authorization value to be used on any calls of the service client instance
         */
        authorizationValue: string;
        /**
         * Endpoint to hit by the service client instance
         */
        apiEndpoint: string;
    }
    /**
     * Class to be used as the base class for the generated service clients.
     */
    abstract class BaseServiceClient {
        private static isCodeSuccessful(responseCode);
        private static buildUrl(endpoint, path, queryParameters, pathParameters);
        private static interpolateParams(path, params);
        private static buildQueryString(params, isQueryStart);
        /**
         * ApiConfiguration instance to provide dependencies for this service client
         */
        protected apiConfiguration: ApiConfiguration;
        /**
         * Creates new instance of the BaseServiceClient
         * @param {ApiConfiguration} apiConfiguration configuration parameter to provide dependencies to service client instance
         */
        protected constructor(apiConfiguration: ApiConfiguration);
        /**
         * Invocation wrapper to implement service operations in generated classes
         * @param method HTTP method, such as 'POST', 'GET', 'DELETE', etc.
         * @param endpoint base API url
         * @param path the path pattern with possible placeholders for path parameters in form {paramName}
         * @param pathParams path parameters collection
         * @param queryParams query parameters collection
         * @param headerParams headers collection
         * @param bodyParam if body parameter is present it is provided here, otherwise null or undefined
         * @param errors maps recognized status codes to messages
         */
        protected invoke(method: string, endpoint: string, path: string, pathParams: Map<string, string>, queryParams: Map<string, string>, headerParams: Array<{
            key: string;
            value: string;
        }>, bodyParam: any, errors: Map<number, string>): Promise<any>;
    }
}
/**
 * An object containing an application ID. This is used to verify that the request was intended for your service.
 * @interface
 */
export interface Application {
    'applicationId': string;
}
/**
 *
 * @interface
 */
export interface Context {
    'System': interfaces.system.SystemState;
    'AudioPlayer'?: interfaces.audioplayer.AudioPlayerState;
    'Display'?: interfaces.display.DisplayState;
}
/**
 * An object providing information about the device used to send the request. The device object contains both deviceId and supportedInterfaces properties. The deviceId property uniquely identifies the device. The supportedInterfaces property lists each interface that the device supports. For example, if supportedInterfaces includes AudioPlayer {}, then you know that the device supports streaming audio using the AudioPlayer interface.
 * @interface
 */
export interface Device {
    'deviceId': string;
    'supportedInterfaces': SupportedInterfaces;
}
/**
 * Enumeration indicating the status of the multi-turn dialog. This property is included if the skill meets the requirements to use the Dialog directives. Note that COMPLETED is only possible when you use the Dialog.Delegate directive. If you use intent confirmation, dialogState is considered COMPLETED if the user denies the entire intent (for instance, by answering “no” when asked the confirmation prompt). Be sure to also check the confirmationStatus property on the Intent object before fulfilling the user’s request.
 * @enum
 */
export declare type DialogState = 'STARTED' | 'IN_PROGRESS' | 'COMPLETED';
/**
 *
 * @interface
 */
export declare type Directive = interfaces.videoapp.LaunchDirective | interfaces.audioplayer.StopDirective | dialog.ConfirmSlotDirective | interfaces.audioplayer.PlayDirective | interfaces.display.RenderTemplateDirective | dialog.ElicitSlotDirective | interfaces.audioplayer.ClearQueueDirective | dialog.DelegateDirective | interfaces.display.HintDirective | dialog.ConfirmIntentDirective;
/**
 * An object that represents what the user wants.
 * @interface
 */
export interface Intent {
    'name': string;
    'slots'?: {
        [key: string]: Slot;
    };
    'confirmationStatus': IntentConfirmationStatus;
}
/**
 * Indication of whether an intent or slot has been explicitly confirmed or denied by the user, or neither.
 * @enum
 */
export declare type IntentConfirmationStatus = 'NONE' | 'DENIED' | 'CONFIRMED';
/**
 * Contains a consentToken allowing the skill access to information that the customer has consented to provide, such as address information. Note that the consentToken is deprecated. Use the apiAccessToken available in the context object to determine the user’s permissions.
 * @interface
 */
export interface Permissions {
    'consentToken'?: string;
}
/**
 * A request object that provides the details of the user’s request. The request body contains the parameters necessary for the service to perform its logic and generate a response.
 * @interface
 */
export declare type Request = interfaces.audioplayer.PlaybackStoppedRequest | interfaces.audioplayer.PlaybackFinishedRequest | events.skillevents.SkillEnabledRequest | services.listManagement.ListUpdatedEventRequest | interfaces.playbackcontroller.PreviousCommandIssuedRequest | events.skillevents.SkillDisabledRequest | interfaces.display.ElementSelectedRequest | services.listManagement.ListItemsUpdatedEventRequest | events.skillevents.PermissionChangedRequest | services.listManagement.ListItemsCreatedEventRequest | events.skillevents.AccountLinkedRequest | SessionEndedRequest | services.listManagement.ListCreatedEventRequest | interfaces.audioplayer.PlaybackStartedRequest | IntentRequest | interfaces.audioplayer.PlaybackNearlyFinishedRequest | services.listManagement.ListItemsDeletedEventRequest | interfaces.messaging.MessageReceivedRequest | interfaces.audioplayer.PlaybackFailedRequest | interfaces.system.ExceptionEncounteredRequest | events.skillevents.PermissionAcceptedRequest | services.listManagement.ListDeletedEventRequest | interfaces.playbackcontroller.NextCommandIssuedRequest | interfaces.playbackcontroller.PauseCommandIssuedRequest | interfaces.playbackcontroller.PlayCommandIssuedRequest | LaunchRequest;
/**
 * Request wrapper for all requests sent to your Skill.
 * @interface
 */
export interface RequestEnvelope {
    'version': string;
    'session'?: Session;
    'context': Context;
    'request': Request;
}
/**
 *
 * @interface
 */
export interface Response {
    'outputSpeech'?: ui.OutputSpeech;
    'card'?: ui.Card;
    'reprompt'?: ui.Reprompt;
    'directives'?: Array<Directive>;
    'shouldEndSession'?: boolean;
}
/**
 *
 * @interface
 */
export interface ResponseEnvelope {
    'version': string;
    'sessionAttributes'?: {
        [key: string]: any;
    };
    'userAgent'?: string;
    'response': Response;
}
/**
 * Represents a single execution of the alexa service
 * @interface
 */
export interface Session {
    'new': boolean;
    'sessionId': string;
    'user': User;
    'attributes'?: {
        [key: string]: any;
    };
    'application': Application;
}
/**
 * An error object providing more information about the error that occurred.
 * @interface
 */
export interface SessionEndedError {
    'type': SessionEndedErrorType;
    'message': string;
}
/**
 * A string indicating the type of error that occurred.
 * @enum
 */
export declare type SessionEndedErrorType = 'INVALID_RESPONSE' | 'DEVICE_COMMUNICATION_ERROR' | 'INTERNAL_SERVICE_ERROR';
/**
 * The reason why session ended when not initiated from the Skill itself.
 * @enum
 */
export declare type SessionEndedReason = 'USER_INITIATED' | 'ERROR' | 'EXCEEDED_MAX_REPROMPTS';
/**
 *
 * @interface
 */
export interface Slot {
    'name': string;
    'value': string;
    'confirmationStatus': SlotConfirmationStatus;
    'resolutions'?: slu.entityresolution.Resolutions;
}
/**
 * An enumeration indicating whether the user has explicitly confirmed or denied the value of this slot.
 * @enum
 */
export declare type SlotConfirmationStatus = 'NONE' | 'DENIED' | 'CONFIRMED';
/**
 * An object listing each interface that the device supports. For example, if supportedInterfaces includes AudioPlayer {}, then you know that the device supports streaming audio using the AudioPlayer interface.
 * @interface
 */
export interface SupportedInterfaces {
    'AudioPlayer'?: interfaces.audioplayer.AudioPlayerInterface;
    'Display'?: interfaces.display.DisplayInterface;
    'VideoApp'?: interfaces.videoapp.VideoAppInterface;
}
/**
 * Represents the user registered to the device initiating the request.
 * @interface
 */
export interface User {
    'userId': string;
    'accessToken'?: string;
    'permissions'?: Permissions;
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface AccountLinkedBody {
        'accessToken'?: string;
    }
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface Permission {
        'scope'?: string;
    }
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface PermissionBody {
        'acceptedPermissions'?: Array<events.skillevents.Permission>;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface AudioItem {
        'stream'?: interfaces.audioplayer.Stream;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface AudioPlayerInterface {
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface AudioPlayerState {
        'offsetInMilliseconds'?: number;
        'token'?: string;
        'playerActivity'?: interfaces.audioplayer.PlayerActivity;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @enum
     */
    type ClearBehavior = 'CLEAR_ALL' | 'CLEAR_ENQUEUED';
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface CurrentPlaybackState {
        'offsetInMilliseconds'?: number;
        'playerActivity'?: interfaces.audioplayer.PlayerActivity;
        'token'?: string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface Error {
        'message'?: string;
        'type'?: interfaces.audioplayer.ErrorType;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @enum
     */
    type ErrorType = 'MEDIA_ERROR_INTERNAL_DEVICE_ERROR' | 'MEDIA_ERROR_INTERNAL_SERVER_ERROR' | 'MEDIA_ERROR_INVALID_REQUEST' | 'MEDIA_ERROR_SERVICE_UNAVAILABLE' | 'MEDIA_ERROR_UNKNOWN';
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @enum
     */
    type PlayBehavior = 'ENQUEUE' | 'REPLACE_ALL' | 'REPLACE_ENQUEUED';
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @enum
     */
    type PlayerActivity = 'PLAYING' | 'PAUSED' | 'FINISHED' | 'BUFFER_UNDERRUN' | 'IDLE' | 'STOPPED';
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface Stream {
        'expectedPreviousToken'?: string;
        'token': string;
        'url': string;
        'offsetInMilliseconds': number;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @enum
     */
    type BackButtonBehavior = 'HIDDEN' | 'VISIBLE';
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface DisplayInterface {
        'templateVersion'?: string;
        'markupVersion'?: string;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface DisplayState {
        'token'?: string;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    type Hint = interfaces.display.PlainTextHint;
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface Image {
        'contentDescription'?: string;
        'sources'?: Array<interfaces.display.ImageInstance>;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface ImageInstance {
        'url': string;
        'size'?: interfaces.display.ImageSize;
        'widthPixels'?: number;
        'heightPixels'?: number;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @enum
     */
    type ImageSize = 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface ListItem {
        'token': string;
        'image'?: interfaces.display.Image;
        'textContent'?: interfaces.display.TextContent;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    type Template = interfaces.display.ListTemplate2 | interfaces.display.ListTemplate1 | interfaces.display.BodyTemplate7 | interfaces.display.BodyTemplate6 | interfaces.display.BodyTemplate3 | interfaces.display.BodyTemplate2 | interfaces.display.BodyTemplate1;
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface TextContent {
        'primaryText'?: interfaces.display.TextField;
        'secondaryText'?: interfaces.display.TextField;
        'tertiaryText'?: interfaces.display.TextField;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    type TextField = interfaces.display.RichText | interfaces.display.PlainText;
}
export declare namespace interfaces.system {
    /**
     *
     * @interface
     */
    interface Error {
        'type': interfaces.system.ErrorType;
        'message'?: string;
    }
}
export declare namespace interfaces.system {
    /**
     *
     * @interface
     */
    interface ErrorCause {
        'requestId': string;
    }
}
export declare namespace interfaces.system {
    /**
     *
     * @enum
     */
    type ErrorType = 'INVALID_RESPONSE' | 'DEVICE_COMMUNICATION_ERROR' | 'INTERNAL_SERVICE_ERROR';
}
export declare namespace interfaces.system {
    /**
     *
     * @interface
     */
    interface SystemState {
        'application': Application;
        'user': User;
        'device': Device;
        'apiEndpoint': string;
        'apiAccessToken'?: string;
    }
}
export declare namespace interfaces.videoapp {
    /**
     *
     * @interface
     */
    interface Metadata {
        'title'?: string;
        'subtitle'?: string;
    }
}
export declare namespace interfaces.videoapp {
    /**
     *
     * @interface
     */
    interface VideoAppInterface {
    }
}
export declare namespace interfaces.videoapp {
    /**
     *
     * @interface
     */
    interface VideoItem {
        'source': string;
        'metadata'?: interfaces.videoapp.Metadata;
    }
}
export declare namespace services.deviceAddress {
    /**
     * Represents the full address response from the service.
     * @interface
     */
    interface Address {
        'addressLine1'?: string;
        'addressLine2'?: string;
        'addressLine3'?: string;
        'countryCode'?: string;
        'stateOrRegion'?: string;
        'city'?: string;
        'districtOrCounty'?: string;
        'postalCode'?: string;
    }
}
export declare namespace services.deviceAddress {
    /**
     *
     * @interface
     */
    interface Error {
        'type'?: string;
        'message'?: string;
    }
}
export declare namespace services.deviceAddress {
    /**
     *
     * @interface
     */
    interface ShortAddress {
        'countryCode'?: string;
        'postalCode'?: string;
    }
}
export declare namespace services.directive {
    /**
     *
     * @interface
     */
    type Directive = services.directive.SpeakDirective;
}
export declare namespace services.directive {
    /**
     *
     * @interface
     */
    interface Error {
        'code': number;
        'message': string;
    }
}
export declare namespace services.directive {
    /**
     *
     * @interface
     */
    interface Header {
        'requestId': string;
    }
}
export declare namespace services.directive {
    /**
     * Send Directive Request payload.
     * @interface
     */
    interface SendDirectiveRequest {
        'header': services.directive.Header;
        'directive': services.directive.Directive;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface AlexaList {
        'listId'?: string;
        'name'?: string;
        'state'?: services.listManagement.ListState;
        'version'?: number;
        'items'?: Array<services.listManagement.AlexaListItem>;
        'links'?: services.listManagement.Links;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface AlexaListItem {
        'id'?: string;
        'version'?: number;
        'value'?: string;
        'status'?: services.listManagement.ListItemState;
        'createdTime'?: string;
        'updatedTime'?: string;
        'href'?: string;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface AlexaListMetadata {
        'listId'?: string;
        'name'?: string;
        'state'?: services.listManagement.ListState;
        'version'?: number;
        'statusMap'?: Array<services.listManagement.Status>;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface AlexaListsMetadata {
        'lists'?: Array<services.listManagement.AlexaListMetadata>;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface CreateListItemRequest {
        'value'?: string;
        'status'?: services.listManagement.ListItemState;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface CreateListRequest {
        'name'?: string;
        'state'?: services.listManagement.ListState;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface Error {
        'type'?: string;
        'message'?: string;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ForbiddenError {
        'Message'?: string;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface Links {
        'next'?: string;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListBody {
        'listId'?: string;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListItemBody {
        'listId'?: string;
        'listItemIds'?: Array<string>;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @enum
     */
    type ListItemState = 'active' | 'completed';
}
export declare namespace services.listManagement {
    /**
     *
     * @enum
     */
    type ListState = 'active' | 'archived';
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface Status {
        'url'?: string;
        'status'?: services.listManagement.ListItemState;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface UpdateListItemRequest {
        'value'?: string;
        'status'?: services.listManagement.ListItemState;
        'version'?: number;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface UpdateListRequest {
        'name'?: string;
        'state'?: services.listManagement.ListState;
        'version'?: number;
    }
}
export declare namespace slu.entityresolution {
    /**
     * Represents a possible authority for entity resolution
     * @interface
     */
    interface Resolution {
        'authority': string;
        'status': slu.entityresolution.Status;
        'values': Array<slu.entityresolution.ValueWrapper>;
    }
}
export declare namespace slu.entityresolution {
    /**
     * Represents the results of resolving the words captured from the user's utterance. This is included for slots that use a custom slot type or a built-in slot type that you have extended with your own values. Note that resolutions is not included for built-in slot types that you have not extended.
     * @interface
     */
    interface Resolutions {
        'resolutionsPerAuthority'?: Array<slu.entityresolution.Resolution>;
    }
}
export declare namespace slu.entityresolution {
    /**
     *
     * @interface
     */
    interface Status {
        'code': slu.entityresolution.StatusCode;
    }
}
export declare namespace slu.entityresolution {
    /**
     * Indication of the results of attempting to resolve the user utterance against the defined slot types.
     * @enum
     */
    type StatusCode = 'ER_SUCCESS_MATCH' | 'ER_SUCCESS_NO_MATCH' | 'ER_ERROR_TIMEOUT' | 'ER_ERROR_EXCEPTION';
}
export declare namespace slu.entityresolution {
    /**
     * Represents the resolved value for the slot, based on the user’s utterance and slot type definition.
     * @interface
     */
    interface Value {
        'name': string;
        'id': string;
    }
}
export declare namespace slu.entityresolution {
    /**
     * A wrapper class for an entity resolution value used for JSON serialization.
     * @interface
     */
    interface ValueWrapper {
        'value': slu.entityresolution.Value;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    type Card = ui.LinkAccountCard | ui.StandardCard | ui.AskForPermissionsConsentCard | ui.SimpleCard;
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface Image {
        'smallImageUrl'?: string;
        'largeImageUrl'?: string;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    type OutputSpeech = ui.PlainTextOutputSpeech | ui.SsmlOutputSpeech;
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface Reprompt {
        'outputSpeech': ui.OutputSpeech;
    }
}
/**
 * An IntentRequest is an object that represents a request made to a skill based on what the user wants to do.
 * @interface
 */
export interface IntentRequest {
    'type': 'IntentRequest';
    'requestId': string;
    'timestamp': string;
    'locale': string;
    'dialogState': DialogState;
    'intent': Intent;
}
/**
 * Represents that a user made a request to an Alexa skill, but did not provide a specific intent.
 * @interface
 */
export interface LaunchRequest {
    'type': 'LaunchRequest';
    'requestId': string;
    'timestamp': string;
    'locale': string;
}
/**
 * A SessionEndedRequest is an object that represents a request made to an Alexa skill to notify that a session was ended. Your service receives a SessionEndedRequest when a currently open session is closed for one of the following reasons: <ol><li>The user says “exit”</li><li>the user does not respond or says something that does not match an intent defined in your voice interface while the device is listening for the user’s response</li><li>an error occurs</li></ol>
 * @interface
 */
export interface SessionEndedRequest {
    'type': 'SessionEndedRequest';
    'requestId': string;
    'timestamp': string;
    'locale': string;
    'reason': SessionEndedReason;
    'error'?: SessionEndedError;
}
export declare namespace dialog {
    /**
     *
     * @interface
     */
    interface ConfirmIntentDirective {
        'type': 'Dialog.ConfirmIntent';
        'updatedIntent'?: Intent;
    }
}
export declare namespace dialog {
    /**
     *
     * @interface
     */
    interface ConfirmSlotDirective {
        'type': 'Dialog.ConfirmSlot';
        'updatedIntent'?: Intent;
        'slotToConfirm': string;
    }
}
export declare namespace dialog {
    /**
     *
     * @interface
     */
    interface DelegateDirective {
        'type': 'Dialog.Delegate';
        'updatedIntent'?: Intent;
    }
}
export declare namespace dialog {
    /**
     *
     * @interface
     */
    interface ElicitSlotDirective {
        'type': 'Dialog.ElicitSlot';
        'updatedIntent'?: Intent;
        'slotToElicit': string;
    }
}
export declare namespace events.skillevents {
    /**
     * This event indicates that a customer has linked an account in a third-party application with the Alexa app. This event is useful for an application that support out-of-session (non-voice) user interactions so that this application can be notified when the internal customer can be associated with the Alexa customer. This event is required for many applications that synchronize customer Alexa lists with application lists. During the account linking process, the Alexa app directs the user to the skill website where the customer logs in. When the customer logs in, the skill then provides an access token and a consent token to Alexa. The event includes the same access token and consent token.
     * @interface
     */
    interface AccountLinkedRequest {
        'type': 'AlexaSkillEvent.SkillAccountLinked';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body': events.skillevents.AccountLinkedBody;
    }
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface PermissionAcceptedRequest {
        'type': 'AlexaSkillEvent.SkillPermissionAccepted';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: events.skillevents.PermissionBody;
    }
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface PermissionChangedRequest {
        'type': 'AlexaSkillEvent.SkillPermissionChanged';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: events.skillevents.PermissionBody;
    }
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface SkillDisabledRequest {
        'type': 'AlexaSkillEvent.SkillDisabled';
        'requestId': string;
        'timestamp': string;
        'locale': string;
    }
}
export declare namespace events.skillevents {
    /**
     *
     * @interface
     */
    interface SkillEnabledRequest {
        'type': 'AlexaSkillEvent.SkillEnabled';
        'requestId': string;
        'timestamp': string;
        'locale': string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface ClearQueueDirective {
        'type': 'AudioPlayer.ClearQueue';
        'clearBehavior'?: interfaces.audioplayer.ClearBehavior;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface PlayDirective {
        'type': 'AudioPlayer.Play';
        'playBehavior'?: interfaces.audioplayer.PlayBehavior;
        'audioItem'?: interfaces.audioplayer.AudioItem;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface PlaybackFailedRequest {
        'type': 'AudioPlayer.PlaybackFailed';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'currentPlaybackState'?: interfaces.audioplayer.CurrentPlaybackState;
        'error'?: interfaces.audioplayer.Error;
        'token'?: string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface PlaybackFinishedRequest {
        'type': 'AudioPlayer.PlaybackFinished';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'offsetInMilliseconds'?: number;
        'token'?: string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface PlaybackNearlyFinishedRequest {
        'type': 'AudioPlayer.PlaybackNearlyFinished';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'offsetInMilliseconds'?: number;
        'token'?: string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface PlaybackStartedRequest {
        'type': 'AudioPlayer.PlaybackStarted';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'offsetInMilliseconds'?: number;
        'token'?: string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface PlaybackStoppedRequest {
        'type': 'AudioPlayer.PlaybackStopped';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'offsetInMilliseconds'?: number;
        'token'?: string;
    }
}
export declare namespace interfaces.audioplayer {
    /**
     *
     * @interface
     */
    interface StopDirective {
        'type': 'AudioPlayer.Stop';
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface BodyTemplate1 {
        'type': 'BodyTemplate1';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'backgroundImage'?: interfaces.display.Image;
        'title'?: string;
        'textContent'?: interfaces.display.TextContent;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface BodyTemplate2 {
        'type': 'BodyTemplate2';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'backgroundImage'?: interfaces.display.Image;
        'image'?: interfaces.display.Image;
        'title'?: string;
        'textContent'?: interfaces.display.TextContent;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface BodyTemplate3 {
        'type': 'BodyTemplate3';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'backgroundImage'?: interfaces.display.Image;
        'image'?: interfaces.display.Image;
        'title'?: string;
        'textContent'?: interfaces.display.TextContent;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface BodyTemplate6 {
        'type': 'BodyTemplate6';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'backgroundImage'?: interfaces.display.Image;
        'textContent'?: interfaces.display.TextContent;
        'image'?: interfaces.display.Image;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface BodyTemplate7 {
        'type': 'BodyTemplate7';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'title'?: string;
        'image'?: interfaces.display.Image;
        'backgroundImage'?: interfaces.display.Image;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface ElementSelectedRequest {
        'type': 'Display.ElementSelected';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'token': string;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface HintDirective {
        'type': 'Hint';
        'hint': interfaces.display.Hint;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface ListTemplate1 {
        'type': 'ListTemplate1';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'backgroundImage'?: interfaces.display.Image;
        'title'?: string;
        'listItems'?: Array<interfaces.display.ListItem>;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface ListTemplate2 {
        'type': 'ListTemplate2';
        'token'?: string;
        'backButton'?: interfaces.display.BackButtonBehavior;
        'backgroundImage'?: interfaces.display.Image;
        'title'?: string;
        'listItems'?: Array<interfaces.display.ListItem>;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface PlainText {
        'type': 'PlainText';
        'text': string;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface PlainTextHint {
        'type': 'PlainText';
        'text': string;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface RenderTemplateDirective {
        'type': 'Display.RenderTemplate';
        'template'?: interfaces.display.Template;
    }
}
export declare namespace interfaces.display {
    /**
     *
     * @interface
     */
    interface RichText {
        'type': 'RichText';
        'text': string;
    }
}
export declare namespace interfaces.messaging {
    /**
     *
     * @interface
     */
    interface MessageReceivedRequest {
        'type': 'Messaging.MessageReceived';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'message': {
            [key: string]: any;
        };
    }
}
export declare namespace interfaces.playbackcontroller {
    /**
     *
     * @interface
     */
    interface NextCommandIssuedRequest {
        'type': 'PlaybackController.NextCommandIssued';
        'requestId': string;
        'timestamp': string;
        'locale': string;
    }
}
export declare namespace interfaces.playbackcontroller {
    /**
     *
     * @interface
     */
    interface PauseCommandIssuedRequest {
        'type': 'PlaybackController.PauseCommandIssued';
        'requestId': string;
        'timestamp': string;
        'locale': string;
    }
}
export declare namespace interfaces.playbackcontroller {
    /**
     *
     * @interface
     */
    interface PlayCommandIssuedRequest {
        'type': 'PlaybackController.PlayCommandIssued';
        'requestId': string;
        'timestamp': string;
        'locale': string;
    }
}
export declare namespace interfaces.playbackcontroller {
    /**
     *
     * @interface
     */
    interface PreviousCommandIssuedRequest {
        'type': 'PlaybackController.PreviousCommandIssued';
        'requestId': string;
        'timestamp': string;
        'locale': string;
    }
}
export declare namespace interfaces.system {
    /**
     *
     * @interface
     */
    interface ExceptionEncounteredRequest {
        'type': 'System.ExceptionEncountered';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'error': interfaces.system.Error;
        'cause': interfaces.system.ErrorCause;
    }
}
export declare namespace interfaces.videoapp {
    /**
     *
     * @interface
     */
    interface LaunchDirective {
        'type': 'VideoApp.Launch';
        'videoItem': interfaces.videoapp.VideoItem;
    }
}
export declare namespace services.directive {
    /**
     *
     * @interface
     */
    interface SpeakDirective {
        'type': 'VoicePlayer.Speak';
        'speech'?: string;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListCreatedEventRequest {
        'type': 'AlexaHouseholdListEvent.ListCreated';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: services.listManagement.ListBody;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListDeletedEventRequest {
        'type': 'AlexaHouseholdListEvent.ListDeleted';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: services.listManagement.ListBody;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListItemsCreatedEventRequest {
        'type': 'AlexaHouseholdListEvent.ItemsCreated';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: services.listManagement.ListItemBody;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListItemsDeletedEventRequest {
        'type': 'AlexaHouseholdListEvent.ItemsDeleted';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: services.listManagement.ListItemBody;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListItemsUpdatedEventRequest {
        'type': 'AlexaHouseholdListEvent.ItemsUpdated';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: services.listManagement.ListItemBody;
    }
}
export declare namespace services.listManagement {
    /**
     *
     * @interface
     */
    interface ListUpdatedEventRequest {
        'type': 'AlexaHouseholdListEvent.ListUpdated';
        'requestId': string;
        'timestamp': string;
        'locale': string;
        'body'?: services.listManagement.ListBody;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface AskForPermissionsConsentCard {
        'type': 'AskForPermissionsConsent';
        'permissions': Array<string>;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface LinkAccountCard {
        'type': 'LinkAccount';
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface PlainTextOutputSpeech {
        'type': 'PlainText';
        'text': string;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface SimpleCard {
        'type': 'Simple';
        'title'?: string;
        'content'?: string;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface SsmlOutputSpeech {
        'type': 'SSML';
        'ssml': string;
    }
}
export declare namespace ui {
    /**
     *
     * @interface
     */
    interface StandardCard {
        'type': 'Standard';
        'title'?: string;
        'text'?: string;
        'image'?: ui.Image;
    }
}
export declare namespace services.deviceAddress {
    /**
     *
     */
    class DeviceAddressServiceClient extends BaseServiceClient {
        constructor(apiConfiguration: ApiConfiguration);
        /**
         *
         * @param {string} deviceId The device Id for which to get the country and postal code
         */
        getCountryAndPostalCode(deviceId: string): Promise<services.deviceAddress.ShortAddress>;
        /**
         *
         * @param {string} deviceId The device Id for which to get the address
         */
        getFullAddress(deviceId: string): Promise<services.deviceAddress.Address>;
    }
}
export declare namespace services.directive {
    /**
     *
     */
    class DirectiveServiceClient extends BaseServiceClient {
        constructor(apiConfiguration: ApiConfiguration);
        /**
         *
         * @param {services.directive.SendDirectiveRequest} sendDirectiveRequest Represents the request object to send in the payload.
         */
        enqueue(sendDirectiveRequest: services.directive.SendDirectiveRequest): Promise<void>;
    }
}
export declare namespace services.listManagement {
    /**
     *
     */
    class ListManagementServiceClient extends BaseServiceClient {
        constructor(apiConfiguration: ApiConfiguration);
        /**
         *
         */
        getListsMetadata(): Promise<services.listManagement.AlexaListsMetadata>;
        /**
         *
         * @param {string} listId Value of the customer’s listId retrieved from a getListsMetadata call
         */
        deleteList(listId: string): Promise<void>;
        /**
         *
         * @param {string} listId The customer’s listId is retrieved from a getListsMetadata call.
         * @param {string} itemId The customer’s itemId is retrieved from a GetList call.
         */
        deleteListItem(listId: string, itemId: string): Promise<void>;
        /**
         *
         * @param {string} listId Retrieved from a call to getListsMetadata
         * @param {string} itemId itemId within a list is retrieved from a getList call
         */
        getListItem(listId: string, itemId: string): Promise<services.listManagement.AlexaListItem>;
        /**
         *
         * @param {string} listId Customer’s listId
         * @param {string} itemId itemId to be updated in the list
         * @param {services.listManagement.UpdateListItemRequest} updateListItemRequest
         */
        updateListItem(listId: string, itemId: string, updateListItemRequest: services.listManagement.UpdateListItemRequest): Promise<services.listManagement.AlexaListItem>;
        /**
         *
         * @param {string} listId The customer’s listId retrieved from a getListsMetadata call.
         * @param {services.listManagement.CreateListItemRequest} createListItemRequest
         */
        createListItem(listId: string, createListItemRequest: services.listManagement.CreateListItemRequest): Promise<services.listManagement.AlexaListItem>;
        /**
         *
         * @param {string} listId Value of the customer’s listId retrieved from a getListsMetadata call.
         * @param {services.listManagement.UpdateListRequest} updateListRequest
         */
        updateList(listId: string, updateListRequest: services.listManagement.UpdateListRequest): Promise<services.listManagement.AlexaListMetadata>;
        /**
         *
         * @param {string} listId Retrieved from a call to GetListsMetadata to specify the listId in the request path.
         * @param {string} status Specify the status of the list.
         */
        getList(listId: string, status: string): Promise<services.listManagement.AlexaList>;
        /**
         *
         * @param {services.listManagement.CreateListRequest} createListRequest
         */
        createList(createListRequest: services.listManagement.CreateListRequest): Promise<services.listManagement.AlexaListMetadata>;
    }
}
export declare namespace services {
    /**
     * Helper class that instantiates an ServiceClient implementation automatically resolving its
     * required ApiConfiguration.
     * @export
     * @class ServiceClientFactory
     */
    class ServiceClientFactory {
        protected apiConfiguration: ApiConfiguration;
        constructor(apiConfiguration: ApiConfiguration);
        getDeviceAddressServiceClient(): deviceAddress.DeviceAddressServiceClient;
        getDirectiveServiceClient(): directive.DirectiveServiceClient;
        getListManagementServiceClient(): listManagement.ListManagementServiceClient;
    }
}
