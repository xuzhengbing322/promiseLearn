class Promise {
    /* constructor是类的默认方法，每个类都必须要有这个方法。如果没有显示定义，类会自动创建一个空的constructor。
    constructor通过new执行，constructor方法默认返回实例对象，即this。
    */
    /*形参executor接受用户自定义的函数。
    函数的形参固定为resolve和rejcet函数。它们由constructor定义，并在用户自定义的函数体中使用。
    当new Promise后，就会生成一个具有属性和方法的实例对象，然后再执行executor的函数体，然后返回最终的实例对象。
     */
    constructor(executor) {
        //设置实例对象的属性:状态和结果值
        this.PromiseState = "pending"
        this.PromiseResult = null
        const self = this
        // 保存异步函数的onResolve/onReject，实现异步任务和实例对象多次调用then方法
        this.callBack = []

        //resolve函数：改变实例对象的状态值(pending=>fulfilled)。它的形参就是实例对象PromiseResult属性的值，由用户或程序自定义。
        function resolve(data) {
            // 仅在状态为pending时，才能执行resolve改变状态。
            // 由于constructor中的属性通过this创建，因此无法直接使用。需要通过self来调用this指定的属性。
            if (self.PromiseState !== "pending") return
            self.PromiseState = "fulfilled"
            self.PromiseResult = data
            // 调用callBack中的onResolve
            setTimeout(() => {
                self.callBack.forEach(item => {
                    item.onResolve(self.PromiseResult)
                })
            })
        }

        //reject函数：改变Promise的状态值(pending=>rejected)。它的形参就是实例对象PromiseResult属性的值，由用户或程序自定义。
        function reject(value) {
            if (self.PromiseState !== "pending") return
            self.PromiseState = "rejected"
            self.PromiseResult = value
            // 调用callBack中的onReject
            setTimeout(() => {
                self.callBack.forEach(item => {
                    item.onReject(self.PromiseResult)
                })
            })
        }

        //executor执行过程中，如果出错，也可以改变promise的状态和值。
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }

    }

    /*构造函数的原型对象中的方法then(Promise.prototype.then)，可以通过实例对象调用该方法 */
    /*then方法封装
    then方法的参数onResole和onReject接受用户自定义函数参数，且它们以实例对象的结果值为参数。
    then方法的作用是根据实例对象的状态值执行不同的函数参数，处理它的结果值。fulfilled执行onResolve，rejected执行onReject。
    */
    then(onResolve, onReject) {
        // 因为then方法由实例对象调用，因此this指向实例对象，因此that也指向这个调用then方法的实例对象
        const that = this
        // 判断参数是否为回调函数
        if(typeof onResolve !== "function"){
            onResolve = value =>{return value}
        }
        if(typeof onReject !== "function"){
            onReject = reason => {throw reason}
        }
        /*then方法的返回结果是promise实例对象，并且由onResolve回调函数的结果决定。
        如果onResolve为非promsie数据，即数字和字符串等等，则返回的promise实例对象的状态为成功，结果值为onResolve的返回值。
        如果onResolve为promise数据，则返回的promise实例对象的状态
        */

        return new Promise((resolve, reject) => {
            // 根据实例对象的状态值执行onResolve/onRject，onResolve/onRject均为用户自定义函数
            //封装函数
            function callback(type) {
                try {
                    //获取回调函数的执行结果
                    let result = type(that.PromiseResult);
                    //判断。这一步存在疑惑：v值等等
                    if (result instanceof Promise) {
                        //如果是 Promise 类型的对象
                        result.then(v => {
                            resolve(v);
                        }, r => {
                            reject(r);
                        })
                    } else {
                        //结果的对象状态为『成功』
                        resolve(result);
                    }
                } catch (e) {
                    reject(e);
                }
            }

            if (that.PromiseState === "fulfilled") {
                setTimeout(() => {
                    callback(onResolve);
                });

                // onResolve(that.PromiseResult)
            }
            if (that.PromiseState === "rejected") {
                setTimeout(() => {
                    callback(onReject);
                });
            }
            /*当promise参数函数的函数体是异步任务时，生成的实例对象的状态为pending。
            因此需要保存此时的onResolve/onReject回调函数，等待异步函数执行完毕并且实例对象的状态发生改变后，再调用。
            */
            if (that.PromiseState === "pending") {
                // 将onResolve/onReject回调函数存储到callBack中
                that.callBack.push({
                    onResolve: function () {
                        callback(onResolve);
                    },
                    onReject: function () {
                        callback(onReject);
                    },
                })
            }
        })
    }

    /*catch 方法
    调用catch方法就相当于调用then方法，只不过它只处理状态为失败的实例对象的结果值。
    */
    catch (onReject) {
        return this.then(undefined, onReject);
    }

    /*添加 resolve 方法
    resolve方法是Promise自身的方法，通过Promise.resolve()调用。它的作用类似于then方法。
    resolve返回的结果由传入的参数决定。如果传入的参数为 非Promise类型的对象, 则返回状态值为成功、结果值为参数的实例对象。
        如果传入的参数为 Promise 对象, 则参数的结果决定了 resolve 的结果
    */
    static resolve(value) {
        //返回promise对象
        return new Promise((resolve, reject) => {
            // 判断参数是否为Promise类型的对象
            if (value instanceof Promise) {
                //参数为promise对象，则参数具有状态值和结果值。使用它调用then方法，根据状态值处理结果值。然后返回实例对象
                value.then(v => {
                    resolve(v);
                }, r => {
                    reject(r);
                })
            } else {
                //状态设置为成功
                resolve(value);
            }
        });
    }

    /*添加 reject 方法。
    resolve方法是Promise自身的方法，通过Promise.reject()调用。
    reject方法返回的结果由传入的参数决定。如果传入的参数为非promise类型的对象，则返回状态值为失败、结果值为参数的实例对象
        如果传入的参数是promise兑现过，则返回状态值为失败，结果值为参数promise对象的实例对象。
    */
    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }

    /*all方法
    all方法是Promise自身的方法，通过Promise.all()调用，它的参数是promise实例对象数组。
    all方法返回一个新的promise实例对象。当参数数组中的每个promise实例对象的状态值都是成功时，返回的promise的状态值才是成功，
        并且结果值为所有参数promise实例对象的结果值数组。
        如果参数数组中遇到一个promise实例对象的状态值是失败，返回的promise状态值就是失败，结果值为首次遇到的失败promsie的结果值
    */
    static all(promises) {
        //返回结果为promise对象
        return new Promise((resolve, reject) => {
            //声明变量
            let count = 0;
            let arr = [];
            //遍历
            for (let i = 0; i < promises.length; i++) {
                //让每个promise实例对象调用then方法，v是实例对象的结果值
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

    /*添加 race 方法。
    race 方法是Promise自身的方法，通过Promise.race()调用.
    返回一个新的promise，第一个完成的promise的结果值和状态决定返回的promise实例对象的结果值和状态。
    */
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