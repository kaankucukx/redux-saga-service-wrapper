# Redux-Saga Service Wrapper
Redux-Saga Service Wrapper is an approach that allows you to manage your services with only one **Saga** and call separate **action** accordingly, the rest is under your control! Perform anything you want.

Yes, you can use **serviceWrapperSaga** for your all service calls and manage your response for error and success cases. We use **[Map object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)** for handling errors.

```javascript 
export const endpoints = {
  filter: () => `anyServicePath`
}
export const getService: () => Promise<GetServiceResponse> = () => axios.get(endpoints.filter());
export const postService: (body: any) => Promise<PostServiceResponse> = (body: any) => axios.post(endpoints.filter(), body);
 
```
 
## GET Service Call
```javascript


function* getServiceSaga({ searchQuery }) {
  try {
    const { filter } = yield serviceWrapperSaga(getService)
    //....
  } catch (e) {
    console.log(e);
  }
}
```

## POST Service Call
```javascript

function* postServiceSaga({ searchQuery }) {
  try {
    const { filter } = yield serviceWrapperSaga(postService, {test: 'TEST'})
    //....
  } catch (e) {
    console.log(e);
  }
}
```
## Handling Errors
```javascript 
Loading .. ;)
```
