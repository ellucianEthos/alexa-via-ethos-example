import { services } from 'ask-sdk-model';
import { PersistenceAdapter } from '../attributes/persistence/PersistenceAdapter';
import { ErrorMapper } from '../dispatcher/error/ErrorMapper';
import { HandlerAdapter } from '../dispatcher/request/handler/HandlerAdapter';
import { RequestMapper } from '../dispatcher/request/mapper/RequestMapper';
/**
 * An interfaces that represents the standard components needed to build {@link Skill}.
 */
export interface SkillConfiguration {
    requestMappers: RequestMapper[];
    handlerAdapters: HandlerAdapter[];
    errorMapper?: ErrorMapper;
    persistenceAdapter?: PersistenceAdapter;
    apiClient?: services.ApiClient;
    customUserAgent?: string;
    skillId?: string;
}
