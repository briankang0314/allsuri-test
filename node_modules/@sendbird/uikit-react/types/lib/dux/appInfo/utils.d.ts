import { ProcessedMessageTemplate } from './initialState';
import { SendbirdMessageTemplate } from '../../../ui/TemplateMessageItemBody/types';
/**
 * Takes JSON parsed template and then returns processed message template for storing it in global state.
 */
export declare const getProcessedTemplate: (parsedTemplate: SendbirdMessageTemplate) => ProcessedMessageTemplate;
export declare const getProcessedTemplatesMap: (parsedTemplates: SendbirdMessageTemplate[]) => Record<string, ProcessedMessageTemplate>;
