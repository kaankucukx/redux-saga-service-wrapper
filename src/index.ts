import axios, { AxiosResponse } from 'axios';
import { call, cancelled } from 'redux-saga/effects';

interface ServiceWrapperSagaParams {
  fn: any;
  args?: any;
}


export function* serviceWrapperSaga({ fn, args }: ServiceWrapperSagaParams): Generator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    return yield call(fn, ...args, { cancelToken: source.token });
  } catch (e) {
    const { response }: { response: AxiosResponse } = e;
    console.log(response, 'response');

  } finally {
    if (yield cancelled()) {
      yield source.cancel();
      yield console.log('CANCELED');
    }
  }
}
