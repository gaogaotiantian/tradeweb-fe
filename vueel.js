var server_url = "http://localhost:8000";
const store = new Vuex.Store( {
    state : {
        isLogin: false,
        username: '',
        token: '',
        email: '',
        cell: '',
        address: '',
        currOrder: {},
        orderPost: {},
        totalPrice: 0
    },
    mutations: {
        SetOrder (state, data) {
            order = data[0];
            totalPrice = data[1];
            state.currOrder = {};
            for (key in order) {
                if (parseInt(order[key][1]) != 0) {
                    state.currOrder[key] = [order[key][0], parseInt(order[key][1])];
                }
            }
            state.totalPrice = totalPrice;
            state.orderPost = data[2];
        },
        SetLogin (state, data) {
            state.isLogin = data;
        },
        SetUser(state, data) {
            state.username = data['username'];
            state.token    = data['token'];
            if (typeof(Storage) !== "undefined") {
                localStorage.username = state.username;
                localStorage.token = state.token;
            }
        },
        SetInfo(state, data) {
            state.email = data['email'];
            state.cell = data['cell'];
        },
        ClearUser(state) {
            state.isLogin = false;
            state.username = "";
            state.token = "";
            if (typeof(Storage) !== "undefined") {
                localStorage.removeItem("username")
                localStorage.removeItem("token")
            }
        }
    },
    actions: {
        CheckTokenValid({commit, state}) {
            $.ajax( {
                url: server_url+"/uservalid",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": state.username, "token":state.token}),
                success: function(msg) {
                    commit('SetLogin', true);
                },
                error: function(msg) {
                    commit('ClearUser');
                }
            })
        },
        UpdateUserInfo({commit, state}) {
            $.ajax( {
                url: server_url+"/myinfo",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": state.username, "token":state.token}),
                success: function(msg) {
                    commit('SetInfo', {"email": msg["email"], "cell": msg["cell"]});
                    v_confirm.email = msg["email"];
                    v_confirm.cell = msg["cell"];
                },
                error: function(msg) {
                    commit('ClearUser');
                }
            })
        },
        Logoff({commit, state}) {
            $.ajax( {
                url: server_url+"/logoff",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": state.username, "token":state.token}),
                success: function(msg) {
                    commit('ClearUser');
                },
                error: function(msg) {
                    alert('Logoff error!');
                }
            })
        }
    }
})

Vue.component('action-confirm-modal', {
    template: `
      <div class="modal bs-modal-sm fade" v-bind:id="id" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-head text-center">
            </div>
            <div class="modal-body">
              {{info}}
            </div>
            <div class="modal-foot">
              <div class="row">
                <div class="col-md-12">
                  <div class="row pull-right">
                    <div class="col-md-12">
                      <button class="btn btn-default" data-dismiss="modal">取消操作</button>
                      <button class="btn" v-bind:class="[button_type]" @click="callback(callback_data)">确认操作</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    props: ['callback', 'callback_data', 'id', 'button_type', 'info'],
    
});

Vue.component('register', {
    computed: {
        isLogin: function() {
            return store.state.isLogin;
        },
        username: function() {
            return store.state.username;
        }
    },
    methods: {
        Logoff: function() {
            store.dispatch('Logoff');
        }
    },
    created() {
        if (typeof(Storage) !== "undefined") {
            console.log(localStorage)
            if (localStorage.username !== undefined) {
                store.commit('SetUser',{"username":localStorage.username,"token":localStorage.token})
                store.dispatch("CheckTokenValid");
            }
        }
    }
});

var v_confirm = new Vue( {
    el: '#confirm_modal',
    data: {
        show_panel: "normal",
        email: "",
        cell: "",
        address: "",
        note: "",
        confirmFail: false,
        err_msg: ""
    },
    computed: {
        order: function() {
            return store.state.currOrder;
        },
        totalPrice: function() {
            return store.state.totalPrice;
        },
        title: function() {
            if (store.state.post && store.state.post.title) {
                return store.state.post.title;
            }
            return "";
        }
    },
    methods: {
        Submit: function() {
            var v = this;
            var ajax_data = {
                reference : store.state.orderPost.id,
                to_user   : store.state.orderPost.author,
                from_user : store.state.username,
                token     : store.state.token,
                from_user_email : this.email,
                from_user_cell : this.cell,
                from_user_address : this.address,
                note : this.note,
                order     : JSON.stringify(store.state.currOrder),
                total_price : store.state.totalPrice
            };
            $.ajax({
                url: server_url+"/request",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(ajax_data),
                success: function(msg) {
                    v.show_panel = 'success';
                    v.confirmFail = false;
                    setTimeout(function(){
                        window.location.replace('/');
                        v.show_panel = 'normal';
                    }, 3000);
                },
                error: function(xhr) {
                    v.confirmFail = true;
                    v.err_msg = JSON.parse(xhr['responseText'])["msg"];
                }
            })
        }
    },
});

var v_login = new Vue( {
    el: '#login_modal',
    data: {
        signup_email_val:"",
        signup_username_val: "",
        signup_username_err_msg: "",
        signup_password_val: "",
        signup_password_again_val: "",
        login_username_val: "",
        login_password_val: "",
        email_valid: true,
        username_valid: true,
        password_valid: true,
        password_again_valid: true,

        err_login: false,
        err_login_msg: "",
        err_reg: false,
        err_reg_msg: ""
    },
    methods: {
        Register: function() {
            var v = this;
            console.log("register")
            $.ajax({
                url: server_url+"/register",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": this.signup_username_val, "password": this.signup_password_val, "email": this.signup_email_val}),
                success: function(msg) {
                    v_login.err_reg = false;
                    store.commit("SetUser", {"username":v.signup_username_val, "token":msg['token']});
                    window.location.replace('/');
                },
                error: function(xhr) {
                    v_login.err_reg = true;
                    v_login.err_reg_msg = JSON.parse(xhr['responseText'])["msg"];
                }
            })
        },
        Login: function() {
            console.log("login");
            $.ajax({
                url: server_url+"/login",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": this.login_username_val, "password": this.login_password_val}),
                success: function(msg) {
                    v_login.err_login = false;
                    store.commit('SetUser', {"username":msg["username"], "token":msg['token']});
                    store.commit('SetLogin', true);
                    window.location.replace('/');
                },
                error: function(xhr) {
                    v_login.err_login = true;
                    v_login.err_login_msg = JSON.parse(xhr['responseText'])["msg"]
                }
            })
        },
        CheckEmailValid: function() {
            if (this.signup_email_val == "") {
                this.email_valid = true
            }
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            this.email_valid = re.test(this.signup_email_val);
        },
        CheckUsernameValid: function() {
            this.username_valid = (this.signup_username_val.length >= 2 && this.signup_username_val.length <= 50)
            if (this.username_valid) {
                $.ajax( {
                    url: server_url+"/uservalid",
                    method: "POST",
                    dataType: "json",
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"username": this.signup_username_val}),
                    success: function(msg) {
                        if (msg["valid"] == true) {
                            v_login.username_valid = false;
                            v_login.signup_username_err_msg = "用户名已被占用"
                        } else {
                            v_login.username_valid = true;
                        }
                    }
                })
            } else {
                this.signup_username_err_msg = "用户名长度错误！"
            }
        },
        CheckPasswordValid: function() {
            this.password_valid = (this.signup_password_val.length >= 8)
        },
        CheckPasswordAgainValid: function() {
            this.password_again_valid = (this.signup_password_val == this.signup_password_again_val);
        }
    }
}) 

var v_new_post = new Vue ( {
    el:'#new_post_modal',
    data: {
        title : "",
        category: "",
        content: "",
        max_item_num : 6,
        items: [],
        prices: [],
        avai: [],
        show_panel: "normal",
        err_msg: ""
    },
    computed: {
        errors : function() {
            var e = [];
            for (var i = 0; i < this.max_item_num; i++) {
                e.push((this.items[i] != "" && this.prices[i] == ""));
            }
            console.log(e)
            return e;
        },
        valid_items : function() {
            var temp_items = [];
            for (var i = 0; i < this.max_item_num; i++) {
                if (this.items[i] != "" && this.prices[i] != "") {
                    temp_items.push({"name":this.items[i], "price":this.prices[i]});
                }
            }
            return temp_items;
        },
        availability : function() {
            var temp_avai = {};
            for (var i = 0; i < this.max_item_num; i++) {
                if (this.items[i] != "" && this.prices[i] != "" && this.avai[i] != "") {
                    temp_avai[this.items[i]] = parseInt(this.avai[i]);
                }
            }
            return temp_avai
        }
    },
    methods: {
        SubmitPost: function() {
            console.log('submit')
            store.dispatch('CheckTokenValid');
            if (store.state.isLogin) {
                var v = this;
                $.ajax( {
                    url: server_url + '/post',
                    method: 'POST',
                    dataType: "json",
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({
                        "category":v.category,
                        "title":v.title,
                        "author":store.state.username,
                        "token":store.state.token,
                        "content":v.content,
                        "items":v.valid_items,
                        "availability":v.availability,
                        "expire_time":86400
                    }),
                    success: function(msg) {
                        v.show_panel = 'success';
                        v.err_msg = "";
                        setTimeout(function(){
                            window.location.replace('/');
                            v.show_panel = 'normal'
                        }, 3000);
                    },
                    error: function(xhr) {
                        v.err_msg = JSON.parse(xhr["responseText"])["msg"];
                    }
                });
            }
        },
        AddLine: function() {
            this.max_item_num += 1;
            this.items.push("");
            this.prices.push("");
        },
        RemoveLine: function() {
            if (this.max_item_num > 0) {
                this.max_item_num -= 1;
                this.items.pop();
                this.prices.pop();
            }
        }
    },
    created() {
        for (var i = 0; i < this.max_item_num; i++) {
            this.items.push("");
            this.prices.push("");
        }
    }
})

var v_nav = new Vue ( {
    el: '#top_nav',
    methods : {
        ChangeContent: function(c) {
            v_main.currPage = c;
            if (c == 'home') {
                $('#home_ul > li').removeClass('active');
                $('#home_ul > li').first().addClass('active');
                v_main.post_category = '外卖';
                v_main.GetPosts();
            } else if (c == 'myOrder') {
                $('#myorder_ul > li').removeClass('active');
                $('#myorder_ul > li').first().addClass('active');
                v_main.order_category = 'toMe';
                v_main.GetOrders();
            }
        }
    }
});

var fake_posts = [
    {title: "post1", author:"author1", expire_time:"1", content:"abcd", items:[{"name":"item1", "price":1}, {"name":"item2", "price":2.2}], is_display:false},
    {title: "post2", author:"author2", expire_time:"1", content:"ajcd", items:[{"name":"item11", "price":1.01}, {"name":"item21", "price":2.09}], is_display:false},
    {title: "post3", author:"author3", expire_time:"1", content:"akcd", items:[{"name":"item1", "price":221}, {"name":"item2", "price":212}], is_display:false},
    {title: "post4", author:"author4", expire_time:"1", content:"alcd", items:[{"name":"item111", "price":1}, {"name":"item2241", "price":2.10}], is_display:false},
    {title: "post5", author:"author5", expire_time:"1", content:"abjd", items:[{"name":"item1", "price":12}, {"name":"item23", "price":2}], is_display:false}
];

Vue.component ('v-items', {
    props: ['items', 'post'],
    data : function() {
        orderVal = {}
        for (idx in this.items) {
            orderVal[this.items[idx]['name']] = [this.items[idx]['price'], 0];
        }
        return {
            order: orderVal
        };
    },
    computed : {
        totalPrice: function() {
            var price = 0;
            for (idx in this.items) {
                var it = this.items[idx];
                if (this.order[it['name']][1] == '') {
                    num = 0;
                } else {
                    num = parseInt(this.order[it['name']][1]);
                    if (isNaN(num)) {
                        return ""
                    }
                    price += parseFloat(it['price']) * parseInt(this.order[it['name']][1]);
                }
            }
            return price.toFixed(2);
        }
    },
    methods : {
        SubmitOrder: function() {
            store.commit('SetOrder', [this.order, this.totalPrice, this.post]);
            store.dispatch('UpdateUserInfo');
        }
    } 
});

Vue.component ('v-post', {
    props: ['post'],
    data : function() {
        return {
            deleteConfirm : false
        }
    },
    computed: {
        deletePost: function() {
            if (this.post['is_deleted'] || this.deleteConfirm) {
                return true;
            }
            return false;
        },
        IsAuthorMe: function() {
            if (store) {
                return this.post.author == store.state.username;
            } else {
                return false;
            }
        },
        IsLogin: function() {
            if (store) {
                return store.state.isLogin;
            } else {
                return false;
            }
        }
    },
    methods: {
        ToggleDisplay: function() {
            v_main.ToggleDisplay(this.post);
        },
        DeletePost: function() {
            var v = this;
            $.ajax({
                url: server_url + '/deletepost',
                method: 'POST',
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    username: store.state.username,
                    token: store.state.token,
                    postid: v.post['id']
                }),
                success: function(msg) {
                    window.location.replace('/');
                }
            })
        },
        SubmitOrder: function() {
            this.$refs.v_items[0].SubmitOrder();
        }
    }
});

Vue.component ('v-order', {
    props: ['order'],
    data: function() {
        return {
            info: "",
            callback: null,
            callback_data: {},
            button_type: "btn-default"
        }
    },
    computed: {
        classObject: function() {
            return {
                'panel-danger': this.order.status=='cancel' || this.order.status=='unfinish' || this.order.status=='decline',
                'panel-warning': this.order.status=='ready',
                'panel-default': this.order.status=='finish',
                'panel-success': this.order.status=='confirm'
            }
        },
        statusText: function() {
            if (this.order['status'] == 'ready') {
                return '待确认';
            } else if (this.order['status'] == 'cancel') {
                return '已取消';
            } else if (this.order['status'] == 'confirm') {
                return '已确认';
            } else if (this.order['status'] == 'decline') {
                return '已拒绝';
            } else if (this.order['status'] == 'finish') {
                return '完成';
            } else if (this.order['status'] == 'unfinish') {
                return '未完成';
            } else {
                return '状态未知';
            }
        },
        orderToMe: function() {
            return store.state.username == this.order.to_user;
        },
        orderFromMe: function() {
            return store.state.username == this.order.from_user;
        },
    },
    methods: {
        ToggleDisplay: function() {
            v_main.ToggleDisplay(this.order);
        },
        Action: function(action) {
            var v = this;
            this.callback = function(data) {
                $.ajax({
                    url: server_url + '/requeststatus',
                    method: 'POST',
                    dataType: "json",
                    contentType: 'application/json;charset=UTF-8',
                    data: data,
                    success: function(msg) {
                        console.log(msg);
                        $('#orderConfirm').modal('hide');
                        window.location.replace('/');
                    },
                    error: function(xhr) {
                        console.log(xhr);
                    }
                })
            };
            this.callback_data = JSON.stringify({
                id: v.order['id'],
                username: store.state.username,
                token: store.state.token,
                status: action
            });
            if (action == 'decline' || action == 'cancel' || action == 'unfinish') {
                this.button_type = "btn-danger";
            } else if (action == 'confirm') {
                this.button_type = 'btn-primary';
            } else if (action == 'finish') {
                this.button_type = 'btn-success';
            } 
            $('#orderConfirm').modal('show');
        }
    }
});

var v_main = new Vue( {
    el: '#main_content',
    data : {
        currPage: "home",
        post_category: "外卖",
        order_category: "toMe",
        firstPageNum: 1,
        lastPageNum: 5,
        currPageNum: 1,
        posts:[],
        orders:[],
    },
    computed: {
        isLogin: function() {
            if (store && store.state) {
                return store.state.isLogin;
            } else {
                return false;
            }
        }
    },
    methods: {
        ToggleDisplay: function(p) {
            var pArr = [];
            if (this.currPage == 'home') {
                pArr = this.posts;
            } else if (this.currPage == 'myOrder') {
                pArr = this.orders;
            }
            if (p['is_display'] == false) {
                for (var i = 0; i < pArr.length; i++) {
                    pArr[i]['is_display'] = false;
                }
                p['is_display'] = true;
            } else {
                p['is_display'] = false;
            }
        },
        GetPosts: function() {
            var v = this;
            v.posts = [];
            if (v.post_category == '我的'){ 
                store.dispatch('CheckTokenValid');
                if (store.state.isLogin) {
                    ajax_url = server_url + '/getmypost';
                    ajax_data = {
                        "username": store.state.username,
                        "token": store.state.token,
                        "start": 10*(v.currPageNum - 1),
                        "end": 10*(v.currPageNum)
                    };
                }
            } else {
                ajax_url = server_url + '/getpost'
                ajax_data = {
                    "category": v.post_category,
                    "start": 10*(v.currPageNum - 1),
                    "end": 10*(v.currPageNum)
                };
            }
            $.ajax({
                url: ajax_url,
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(ajax_data),
                success: function(msg) {
                    for (var i = 0; i < msg.length; i++) {
                        msg[i].is_display = false;
                    }
                    v.posts = JSON.parse(JSON.stringify(msg));
                }
            })
        },
        GetOrders: function() {
            var v = this;
            v.orders = [];
            ajax_data = {
                "username": store.state.username,
                "token": store.state.token,
                "start": 10*(v.currPageNum - 1),
                "end": 10*(v.currPageNum),
                "direction": v.order_category,
            };
            $.ajax({
                url: server_url + '/getrequest',
                method: 'POST',
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(ajax_data),
                success: function(msg) {
                    for (var i = 0; i < msg.length; i++) {
                        msg[i].is_display = false;
                        msg[i].order = JSON.parse(msg[i].order);
                    }
                    v.orders = JSON.parse(JSON.stringify(msg));
                    for (var i = 0; i < v.orders.length; i++) {
                        v.orders[i].order = JSON.parse(v.orders[i].order);
                    }
                    console.log(v.orders)
                },
                error: function(xhr) {
                    console.log(xhr);
                },
            })
        },
        ChangePageNum: function(pageNum) {
            if (pageNum >= 1) {
                this.currPageNum = pageNum;
                if (pageNum > 3) {
                    this.firstPageNum = pageNum - 2;
                    this.lastPageNum = pageNum + 2;
                } else {
                    this.firstPageNum = 1;
                    this.lastPageNum = 5;
                }
                if (this.currPage == 'home') {
                    this.GetPosts();
                } else if (this.currPage == 'myOrder') {
                    this.GetOrders();
                }
            }
        },
    },
    mounted() {
        this.GetPosts();
    }
});
