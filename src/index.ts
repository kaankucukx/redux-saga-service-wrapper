import axios, { AxiosResponse } from 'axios';
import { call, cancelled } from 'redux-saga/effects';

interface ServiceWrapperSagaParams {
  fn: any;
  args?: any;
}


export function* serviceWrapperSaga<T1 extends Array<any>>(fn: (...args: any[]) => any, handleError?: Map<number, () => void>, ...args: T1): Generator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    return yield call(fn, ...args, { cancelToken: source.token });
  } catch (e) {
    const { response }: { response: AxiosResponse } = e;
    console.error(response, 'serviceWrapperSaga response');
    handleError?.get(response.status)?.()
  } finally {
    if (yield cancelled()) {
      yield source.cancel();
      yield console.log('CANCELED');
    }
  }
}
