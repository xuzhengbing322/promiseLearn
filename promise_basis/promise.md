# Promise的方法

​	Promise自身有resolve()、reject()、all()、race()方法，promise的实例对象中有状态值和结果值，对象的原型中有then()、catch()方法

​	参数函数resolve(data)的作用是将状态值从pending改为fulfilled，并将参数数据添加到Promise的实例对象中。参数函数reject(value)的作用是将状态值从pending改为rejected，并将参数数据添加到Promise的实例对象中。

1、then()有两个用户自定义的形参函数。then()的作用是根据实例对象的状态值执行不同的函数参数，处理它的结果值。fulfilled执行onResolve，rejected执行onReject。then()的返回结果是promise对象。

2、catch()处理状态值为rejected的promise实例对象的结果。

3、resolve()返回的结果由传入的参数决定。如果传入的参数为非Promise类型的对象，则返回的promise实例对象的状态值为fulfilled，结果值为参数。如果传入的参数为 Promise 实例对象, 则参数的结果决定了 resolve()的结果。

4、reject()返回的结果由传入的参数决定。如果传入的参数为非promise类型的对象，则返回的promise实例对象的状态值为rejected，结果值为参数。如果传入的参数是promise实例对象，则返回的promise实例对象的状态值为rejected，结果值为参数promise实例对象的结果值。

5、all([])返回一个新的promise实例对象。当参数数组中的每个promise实例对象的状态值都是成功时，all()返回的promise的状态值才是成功，并且结果值为所有参数promise实例对象的结果值数组。如果参数数组中遇到一个promise实例对象的状态值是失败，all()返回的promise状态值就是失败，结果值为首次遇到的失败promsie的结果值

6、race([])返回一个新的promise，第一个完成的promise的结果值和状态决定返回的promise实例对象的结果值和状态。