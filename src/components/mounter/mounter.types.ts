import type { UserControlProps } from 'litmoss-hooks/dist/control/userControl/userControl.types';

export interface MounterProps extends UserControlProps {
  onDidMount: () => void;
}
