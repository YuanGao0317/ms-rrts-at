import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addAuthUser } from 'src/features/auth/reducers/auth.reducer';
import { useVerifyEmailMutation } from 'src/features/auth/services/auth.service';
import Alert from 'src/shared/alerts/Alert';
import { IResponse } from 'src/shared/common.interface';
import { AUTH_FETCH_STATUS } from 'src/shared/utils/constants';
import { useAppDispatch } from 'src/store/store';

const ConfirmEmail: FC = (): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [status, setStatus] = useState<string>(AUTH_FETCH_STATUS.IDLE);
  const [searchParams] = useSearchParams({});
  const dispatch = useAppDispatch();
  const [verifyEmail] = useVerifyEmailMutation();

  const onVerifyEmail = useCallback(async (): Promise<void> => {
    try {
      const result: IResponse = await verifyEmail(`${searchParams.get('v_token')}`).unwrap();
      setAlertMessage('Email verified successfully.');
      setStatus(AUTH_FETCH_STATUS.SUCCESS);
      dispatch(addAuthUser({ authInfo: result.user }));
    } catch (err) {
      setStatus(AUTH_FETCH_STATUS.ERROR);
      if ('data' in err) {
        setAlertMessage(err?.data.message);
      } else {
        setAlertMessage(err?.error);
      }
    }
  }, [dispatch, searchParams, verifyEmail]);

  useEffect(() => {
    onVerifyEmail();
  }, [onVerifyEmail]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-6 py-8 mt-20 lg:py-0">
      <h1 className="m-4 text-xl font-bold">Verify Email</h1>
      <div className="min-w-[30%] max-w-max">
        <Alert type={status} message={alertMessage} />
      </div>
      <Link
        to="/"
        className="rounded bg-sky-500 px-6 py-3 mt-5 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
      >
        Continue to Home
      </Link>
    </div>
  );
};

export default ConfirmEmail;
