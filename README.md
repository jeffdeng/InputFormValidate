# inputForm

表单验证，把表单抽象出来，组件化开发表单验证.

普通的本地逻辑验证比较好处理，就是正则匹配一下就然后控制样式。

那么遇到一个按钮，点击后触发一个Ajax验证的呢，或者一个嵌套一个的？这时可以把这个按钮也抽象化为一个Input加入表单校验里面去，虽然这个按钮只能点击不能类似input输入。而且，这个按钮控制的样式可以是任意常规input的验证成功或失败的样式，这样就可以和常规的解耦，每个input只负责自己的样式控制。

##按钮也抽象化为一个特殊Input例子

特别是真对ajax嵌套ajax,有些嵌套3个以上的，逻辑相对不清晰。我这里做了ajax嵌套扁平化处理，逻辑变更要去掉一个ajax嵌套也很容易，代码可维护下大大增加。
   
    var ajaxCodeInput = ajaxInput({
        type:'post',
        selector:'.getcode',
        ievent:'click',
        url:'index.php',
        localcheckRule:  function () {
            //这里处理ajax请求之前的逻辑，返回false就不走ajax
            return true;
        },
        getSendData: function () {
            return {
                username:$('#username').val().trim()
            };
        },
        dataResolve:  function (data) {
            //请求成功，处理页面元素显示
        },
        canContinue:function (data) {
            if (data && data.status == "success") {
                return false;
            }
            return true; //根据后端返回的结果，返回true 继续走then的ajax
        },
    }).then({
        type:'get',
        url:'index2.php',
        getSendData: function () {
            return {
                mobile:$('#username').val().trim(),
                valiCode:$('#Valicode').val().trim()
            };
        },
        dataResolve:  function (data) {
            //请求成功，处理页面元素显示
        },
        canContinue:function (data) {
            return false;
        },
    }).done();