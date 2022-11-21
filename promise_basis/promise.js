class Promise {

    //构造方法
    //形参executor接收用户定义的实参函数。这个函数有两个函数类型的形参，执行executor时会调用这两个函数形参
    //Promise中有状态值PromiseState，以及结果值PromiseResult。执行exector的函数体，就是执行resolve和reject函数，来改变状态值和结果值。
    constructor(executor) {
        this.PromiseState = "pending"
        this.PromiseResult = null
        const self = this
        //创建数组，当exector中有异步函数时，存储then()方法的形参函数。以便异步函数执行后，状态值发生改变后，执行数组中存储的形参函数。
        this.callbacks = []

        //函数resolve的作用：改变Promise的状态值(pending=>fulfilled)，它的形参就是结果值PromiseResult。
        function resolve(data) {
            //状态只能改变一次，改变以后就不再执行resolve函数
            if (self.PromiseState !== "pending") return
            self.PromiseState = "fulfilled"
            self.PromiseResult = data;

            setTimeout(() => {
                //调用callbacks数组内的对象中的onResolve方法，从而处理结果值。
                self.callbacks.forEach(item => {
                    item.onResolve(data);
                });
            });

        }

        //函数reject的作用：改变Promise的状态值(pending=>rejected)，它的形参就是结果值PromiseResult。
        function reject(data) {
            //状态只能改变一次，改变以后就不再执行reject函数
            if (self.PromiseState !== "pending") return
            self.PromiseState = "rejected"
            self.PromiseResult = data;


            setTimeout(() => {
                self.callbacks.forEach(item => {
                    item.onReject(data);
                });
            });
        }

        //executor执行过程中，如果出错，也可以改变promise的状态和值。
        try {
            //执行executor函数时，需要传入两个函数类型的实参。
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    //then 方法封装
    /*then方法有两个函数式形参。
    then()的作用：实例化Promise后，实例对象有自己的状态值和结果值。根据不同的状态值，执行不同的参数函数，处理结果值。fulfilled执行onResolve，rejected执行onReject。

    */
    then(onResolve, onReject) {
        const self = this

        //判断回调函数参数
        if (typeof onReject !== 'function') {
            onReject = reason => {
                throw reason;
            }
        }
        if (typeof onResolve !== 'function') {
            onResolve = value => value;
            //value => { return value};
        }

        //then()方法的返回结果是一个promise实例对象。
        return new Promise((resolve, reject) => {
            //封装函数
            function callback(type) {
                try {
                    //获取回调函数的执行结果。
                    //type是then(onResolve,onReject)的某一个参数函数。将实例对象的PromiseResult作为onResolve/onReject的参数。
                    let res = type(self.PromiseResult)
                    if (res instanceof Promise) {
                        //如果回调函数的执行结果是promise实例对象，则这个实例对象可以调用then()。val指向success
                        res.then(val => {
                            resolve(val)
                        }, err => {
                            reject(err)
                        })
                    } else {
                        //结果对象的状态为成功.返回的结果就是回调函数执行的结果
                        resolve(res)
                    }
                } catch (err) {
                    reject(err)
                }
            }


            //如果实例对象的状态值为fulfilled，则执行这个分支。即执行callback(onResolve)，onResolve是第一个参数函数，它有一个形参。
            if (this.PromiseState === "fulfilled") {
                setTimeout(() => {
                    callback(onResolve);
                });

            }
            if (this.PromiseState === "rejected") {
                setTimeout(() => {
                    callback(onReject);
                });

            }
            /*当executor中有异步函数时，实例对象的状态为pending。当异步函数中的（resolve或reject）执行完后，状态值和结果值才会改变。此时需要依据状态值执行对应的onResolve或onReject。
            可是，resolve和reject函数只能调用自己作用域和Promise作用域中的函数，无法调用then方法中的函数参数。
            由于，实例对象继承了Promise。因此可以在Promise中创建一个数组，当实例对象状态值为pending时，就将onResolve和onReject存入数组中。这样这样resolve和reject函数在改变状态后，就能调用onResolve和onReject
            */
            if (this.PromiseState === "pending") {
                this.callbacks.push({
                    onResolve: function () {
                        callback(onResolve)

                    },
                    onReject: function () {
                        callback(onReject)

                    }
                })
            }
        })

    }

    //catch 方法封装
    catch(onReject) {
        return this.then(undefined, onReject)
    }

    //添加resolve方法 
    //resolve方法不属于实例对象，它属于类。所以使用static关键字表明这是静态成员。
    static resolve(value) {
        //返回Promise对象
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            } else {
                //状态设置为成功
                resolve(value)
            }
        })
    }


    //添加 reject 方法
    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }



    //添加 all 方法
    static all(promises) {
        //返回结果为promise对象
        return new Promise((resolve, reject) => {
            //声明变量
            let count = 0;
            let arr = [];
            //遍历
            for (let i = 0; i < promises.length; i++) {
                //
                promises[i].then(v => {
                    //得知对象的状态是成功
                    //每个promise对象 都成功
                    count++;
                    //将当前promise对象成功的结果 存入到数组中
                    arr[i] = v;
                    //判断
                    if (count === promises.length) {
                        //修改状态
                        resolve(arr);
                    }
                }, r => {
                    reject(r);
                });
            }
        });
    }

    //添加 race 方法
    static race(promises) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    //修改返回对象的状态为 『成功』
                    resolve(v);
                }, r => {
                    //修改返回对象的状态为 『失败』
                    reject(r);
                })
            }
        });
    }

}









