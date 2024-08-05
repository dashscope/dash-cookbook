import { useContext } from 'react';

import { ConfigContext } from '@/providers/configProvider';

export default function useConfig() {
  return useContext(ConfigContext);
}
