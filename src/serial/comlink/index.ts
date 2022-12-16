import TransferHandler from './TransferHandler';
import { Deserializer } from '..';
export { TransferHandlerRegistration } from './types';
export const transferHandler = new TransferHandler(new Deserializer());
export default transferHandler;
