import axios from 'axios';
import { trackRequests } from './requestLoading';

// No store authorization header or store-specific error handling on third parties.
export const externalApi = trackRequests(axios.create({ timeout: 20000 }));
