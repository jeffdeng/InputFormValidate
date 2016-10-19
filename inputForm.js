(function () {
    function ajaxInput(option) {
        var options = option || {};
        this.exeArr = [options];
        this.checkResult = true,
            this.index = 0,
            this.selector = options.selector || '',
            this.ievent = options.ievent || 'click',
            this.init();
    };

    ajaxInput.prototype = {
        constructor: ajaxInput,
        init: function () {
        },
        checkRuleAndCallBack: function () {
            return this.checkResult;
        },
        ajax: function (option, data) {
            //处理option
            var that = this;
            var sendData = {};
            if (option.getSendData) {
                sendData = option.getSendData.call(that);
            }
            $.ajax({
                type: option.type || 'get',
                url: option.url || '',
                data: sendData,
                async: option.async || 'async',
                dataType: option.dataType || 'json',
                success: function (data) {

                    option.dataResolve && option.dataResolve.call(that, data);//处理数据

                    var canContinue = option.canContinue.call(that, data);

                    if (canContinue) {
                        that.index++;
                    }

                    if (that.index >= that.exeArr.length) {
                        return false;
                    }

                    var newoption = that.exeArr[that.index];
                    if (newoption && canContinue) {
                        that.ajax(newoption, data);
                    }
                }
            });
        },
        then: function (option) {
            this.exeArr.push(option);
            return this;
        },
        done: function () {
            var that = this;
            $(this.selector).on(this.ievent, function () {
                that.index = 0;//每次点击恢复为0
                var option = that.exeArr[that.index];

                if (option) {
                    if (option.localcheckRule && !option.localcheckRule.call(that)) {
                        return false;
                    }
                    that.ajax(option);
                }

            });
            return this;
        },
        request: function () {
            //立即请求，和done的区别就是这个不和任何元素绑定
            var that = this;
            that.index = 0;//每次点击恢复为0
            var option = that.exeArr[that.index];

            if (option) {
                if (option.localcheckRule && !option.localcheckRule.call(that)) {
                    return false;
                }
                that.ajax(option);
            }
            return this;
        },
    }

    // 暴露接口
    window.ajaxInput = function (options) {
        return new ajaxInput(options);
    };
})();

var InputClass = function (options) {

    var input = {};

    var defaultRule = {
        'username': /^1\d{10}$/,
        'password': /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,18}$/,//重置密码和注册用
        'oldpass': /^.{6,18}$/,//登录的时候用，之前可以纯数字
        'emailRule': /^[_a-zA-Z0-9_-_._-]+@([_a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,3}$/,
        'numRule': /^[0-9]*$/,
        'codeRule': /^[a-zA-Z0-9]{4,6}$/,
    }

    //默认配置
    var defaultOptions = {
        selector: '',
        rule: '',
        ruletype: '',//参考this.defaultRule的key
        ievent: 'blur',//参考this.defaultRule的key
        initCallback: function () {
            //初始化方法后的回调
           // console.log('initCallback');
        },
        ruleSuccess: function () {
            // this.checkRule true 情况下调用的回调函数，,show css 之类的
            console.log('checkRuleSuccess');
        },
        ruleFail: function () {
            //this.checkRule false 情况下调用的回调函数,show css 之类的
            console.log('checkRuleFail');
        },
        checkRule: function () {
            //逻辑上的匹配，符合返回true,否者返回false
            var value = $(this.selector).val().trim();
            if (this.rule) {
                if (!this.rule.test(value)) {
                    return false;
                }
            }
            return true;
        },
        checkRuleAndCallBack: function () {
            //主要给外部调用的函数,配合样式
            //js校验方法，当checkRuleAndCallBack的校验不符合时，可以覆盖,比如ajax
            if (this.checkRule()) {
                this.ruleSuccess($(this.selector));
                return true;
            } else {
                this.ruleFail($(this.selector));
                return false;
            }
        },
    };


    var extendOptions = $.extend(defaultOptions, options);

    //初始化方法
    var init = function () {

        for (var key in extendOptions) {
            input[key] = extendOptions[key];
        }

        var r = extendOptions.ruletype;

        if (r != '' && defaultRule[r]) {
            input['rule'] = defaultRule[r];
        }

        if (input.initCallback) input.initCallback(); //执行初始化后的回调

        bindEvent();

    };

    //绑定处理方法
    var bindEvent = function () {
        $(input.selector).on(input.ievent, function () {

            if (input.ajaxcheckRule) // ajax 校验优先，否者才走本地校验
            {
                input.ajaxcheckRule();

            } else(input.checkRuleAndCallBack)
            {
                input.checkRuleAndCallBack();
            }

        })
    };

    init();

    return input;
};
//inputClass End

var FormClass = function (options) {
    var form = {};
    //默认配置
    var defaultOptions = {
        selector: '',
        initCallback: null,//初始化方法后的回调
        inputArr: [],//input框的 id class 回调数组
        submitCallback: null,
    };

    var extendOptions = $.extend(defaultOptions, options);

    //初始化方法
    var init = function () {
        //options属性绑定对象
        for (var key in extendOptions) {
            form[key] = extendOptions[key];
        }

        if (form.initCallback) form.initCallback(); //执行初始化后的回调

        //提交数据到后台,绑定
        $(form.selector).on('click', function () {
            if (checkEvent() && form.submitCallback) {
                form.submitCallback();//执行回调
            }
            return false;
        })

    };

    //检测通过为true ,否者为false
    var checkEvent = function () {
        for (var i = 0; i < form.inputArr.length; i++) {
            var elem = form.inputArr[i];
            if (elem.checkRuleAndCallBack && !elem.checkRuleAndCallBack()) {
                return false;
            }
        }
        return true;
    };

    init();

    return form;
}
//formClass END