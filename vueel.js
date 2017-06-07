//var server_url = "http://localhost:8000";
var server_url = "https://fathomless-island-85775.herokuapp.com/";

$.cloudinary.config({ cloud_name: 'xueziji', api_key: '588985454677234'});

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
        totalPrice: 0,
        level: 0,
        cards: {},
        levelStat: [{'benefit': 0, 'post_gap': 0, 'post_limit': 0}, {'benefit': 1, 'post_gap': 24, 'post_limit': 3}, {'benefit': 2, 'post_gap': 6, 'post_limit': 5}, {'benefit': 3, 'post_gap': 3, 'post_limit': 8}, {'benefit': 4, 'post_gap': 1, 'post_limit': 12},{'benefit': 4, 'post_gap': 1, 'post_limit': 12}, {'benefit': 5, 'post_gap': 0.5, 'post_limit': 17}],
        pendingRequests: 0,
        checkusername: "",
        loadedLocal: false,
        categories: ['全部','食品','衣物','学术','家具','电子','拼车','其他','我的'],
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
        SetCheckUserName(state, data) {
            state.checkusername = data['username'];
        },
        SetInfo(state, data) {
            state.email = data['email'];
            state.cell = data['cell'];
            state.address = data['address'];
        },
        SetLevel(state, data) {
            state.level = data;
        },
        SetCards(state, data) {
            state.cards = data;
        },
        SetLoadedLocal(state, data){
            state.loadedLocal = data;
        },
        SetPendingRequests(state, data) {
            state.pendingRequests = data;
        },
        SetLevelStat(state, data) {
            state.levelStat = data;
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
            if (state.loadedLocal == false) {
                if (typeof(Storage) !== "undefined") {
                    if (localStorage.username !== undefined) {
                        store.commit('SetUser',{"username":localStorage.username,"token":localStorage.token})
                    }
                }
                store.commit('SetLoadedLocal', true);
            }
            $.ajax( {
                url: server_url+"/uservalid",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": state.username, "token":state.token}),
                success: function(msg) {
                    if (msg['valid'] == true) {
                        commit('SetLogin', true);
                    } else {
                        commit('ClearUser');
                    }
                    
                },
                error: function(msg) {
                    commit('ClearUser');
                }
            })
        },
        UpdateUserInfo({commit, state}) {
            if (state.loadedLocal == false) {
                if (typeof(Storage) !== "undefined") {
                    if (localStorage.username !== undefined) {
                        store.commit('SetUser',{"username":localStorage.username,"token":localStorage.token})
                    }
                }
                store.commit('SetLoadedLocal', true);
            }
            return new Promise((resolve, reject) => {
                $.ajax( {
                    url: server_url+"/myinfo",
                    method: "POST",
                    dataType: "json",
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"username": state.username, "token":state.token}),
                    success: function(msg) {
                        commit('SetInfo', {"email": msg["email"], "cell": msg["cell"], "address": msg['address']});
                        commit('SetLevel', msg['level']);
                        commit('SetCards', msg['cards']);
                        commit('SetPendingRequests', msg['pending_requests']);
                        v_confirm.email = msg["email"];
                        v_confirm.cell = msg["cell"];
                        v_confirm.address = msg["address"];
                        resolve(msg);
                    },
                    error: function(msg) {
                        commit('ClearUser');
                        reject(msg);
                    }
                })
            })
        },
        GetLevelStat({commit, state}) {
            $.ajax( {
              url: server_url+"/levelStat",
              method: "POST",
              dataType: "json",
              contentType: 'application/json;charset=UTF-8',
              data: JSON.stringify({}),
              success: function(msg) {
                  commit('SetLevelStat', msg);
              }
            });
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
                    commit('ClearUser');
                }
            })
        }
    }
})


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
    mounted() {
        store.dispatch("CheckTokenValid");
    }
});

Vue.component('v-purse', {
    template: `
        <div>
          <div class="panel panel-default">
            <div class="panel-heading">
              <b>我的卡包</b>
            </div>
            <div class="panel-body">
              <div v-if="Object.keys(cards).length == 0">
                您暂时没有任何卡哟！
              </div>
              <div>
                <div class="panel panel-default" v-for="num, name in cards">
                  <div class="panel-body">
                    <div class="row">
                      <div class="col-md-8 col-xs-8">
                        {{name}} x{{num}}
                      </div>
                      <div class="col-md-4 col-xs-4">
                        <button class="btn btn-sm btn-primary pull-right" v-if="CardUsable(name, target)" @click="UseCard(name, target)">使用</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    props: ["target"],
    computed: {
        cards: function() {
            return store.state.cards
        }
    },
    methods: {
        CardUsable: function(cardname, target) {
            if (["小队长卡","中队长卡","大队长卡"].indexOf(cardname) >= 0) {
                if (Object.keys(target).length == 0) {
                    return true;
                }
            } else if (["加粗卡","变红卡","变绿卡","变蓝卡"].indexOf(cardname) >= 0) {
                if (Object.keys(target).indexOf("postid") >= 0) {
                    return true;
                }
            }
            return false;
        },
        UseCard: function(cardName) {
            var v = this;
            $.ajax({
                url: server_url + '/usecard',
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    username: store.state.username,
                    token: store.state.token,
                    cardname: cardName,
                    target: v.target
                }),
                success: function(msg) {
                    store.dispatch("UpdateUserInfo");
                    v.$emit('usecard');
                },
                error: function(xhr) {
                    v_err_msg.ShowError(xhr['responseJSON']['msg']);
                }
            })
        },
    }
})

var v_card_use = new Vue( {
    el: '#card_use_modal',
    data: {
        success: false,
        target: {},
    },
    methods: {
        SetTarget: function(target) {
            this.target = target;
            this.success = false;
        }
    }
})

var v_confirm_action = new Vue( {
    el: '#action_confirm',
    data: {
        info: "",
        callback: function(){},
        callback_data: {},
        button_type: "btn-default"
    },
    methods: {
        SetAction: function(callback, callback_data, button_type, info) {
            this.callback = callback;
            this.callback_data = callback_data;
            this.button_type = button_type;
            this.info = info;
            $('#action_confirm').modal('show');
        }
    }
});

var v_err_msg = new Vue( {
    el: '#err_msg_modal',
    data: {
        content: ""
    },
    methods: {
        ShowError: function(msg) {
            this.content = msg;
            $('#err_msg_modal').modal('show');
        }
    }
})

var v_confirm = new Vue( {
    el: '#confirm_modal',
    data: {
        show_panel: "normal",
        email: "",
        cell: "",
        address: "",
        note: "",
        confirmFail: false,
        err_msg: "",
        isLoading: false
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
            this.isLoading = true;
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
                order     : store.state.currOrder,
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
                    v.isLoading = false;
                    setTimeout(function(){
                        window.location.replace('/');
                        v.show_panel = 'normal';
                    }, 3000);
                },
                error: function(xhr) {
                    v.isLoading = false;
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
        login_remember_val: "",
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
            $.ajax({
                url: server_url+"/register",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": this.signup_username_val, "password": this.signup_password_val, "email": this.signup_email_val}),
                success: function(msg) {
                    v_login.err_reg = false;
                    store.commit("SetUser", {"username":v.signup_username_val, "token":msg['token']});
                    store.commit('SetLogin', true);
                    setTimeout(function() {
                        window.location.replace('/')},
                        500
                    );
                },
                error: function(xhr) {
                    v_login.err_reg = true;
                    v_login.err_reg_msg = JSON.parse(xhr['responseText'])["msg"];
                }
            })
        },
        Login: function() {
            $.ajax({
                url: server_url+"/login",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": this.login_username_val, 
                    "password": this.login_password_val,
                    "remember": this.login_remember_val
                }),
                success: function(msg) {
                    v_login.err_login = false;
                    store.commit('SetUser', {"username":msg["username"], "token":msg['token']});
                    store.commit('SetLogin', true);
                    setTimeout(function() {
                        window.location.replace('/')},
                        500
                    );
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
        pic_link: "",
        items: [],
        prices: [],
        avai: [],
        images: [],
        show_panel: "normal",
        err_msg: "",
        isLoading: false,
    },
    computed: {
        errors : function() {
            var e = [];
            for (var i = 0; i < this.max_item_num; i++) {
                e.push((this.items[i] != "" && this.prices[i] == ""));
            }
            return e;
        },
        has_error: function() {
            for (var i = 0; i < this.errors.length; i++) {
                if (this.errors[i] == true) {
                    return true;
                }
            }
            return false;
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
        },
        level_item_limit: function() {
            return store.state.levelStat[store.state.level]['post_limit'];
        },
        categories: function() {
            return store.state.categories.slice(1);
        }
    },
    methods: {
        SubmitPost: function() {
            store.dispatch('CheckTokenValid');
            if (this.has_error) {
                this.err_msg = "表格输入有误";
            } else if (this.valid_items.length == 0) {
                this.err_msg = "至少需要一个物品！";
            } else if (store.state.isLogin) {
                var v = this;
                this.isLoading = true;
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
                        "images":v.images,
                        "expire_time":86400
                    }),
                    success: function(msg) {
                        v.isLoading = false;
                        v.show_panel = 'success';
                        v.err_msg = "";
                        setTimeout(function(){
                            window.location.replace('/');
                            v.show_panel = 'normal'
                        }, 3000);
                    },
                    error: function(xhr) {
                        v.isLoading = false;
                        v.err_msg = JSON.parse(xhr["responseText"])["msg"];
                    }
                });
            }
        },
        RemoveImage: function(im) {
            var idx = this.images.indexOf(im);
            if (idx > -1) {
                this.images.splice(idx, 1);
            }
        },
        AddImage: function(link) {
            console.log(link)
            if (link.length > 0) {
                this.images.push(link);
                if (link == pic_link) {
                    this.pic_link = "";
                }
            }
        },
        AddLine: function() {
            if (this.max_item_num < this.level_item_limit) {
                this.max_item_num += 1;
                this.items.push("");
                this.prices.push("");
                this.avai.push("");
            }
        },
        RemoveLine: function() {
            if (this.max_item_num > 0) {
                this.max_item_num -= 1;
                this.items.pop();
                this.prices.pop();
                this.avai.pop();
            }
        }
    },
    created() {
        this.max_item_num = 3;
        for (var i = 0; i < this.max_item_num; i++) {
            this.items.push("");
            this.prices.push("");
            this.avai.push("");
        }
    }
})

var v_nav = new Vue ( {
    el: '#top_nav',
    data: {
        category: "全部"
    },
    computed: {
        pendingRequests: function() {
            return store.state.pendingRequests;
        }
    },
    methods : {
        ChangeContent: function(c) {
            $('#header-collapse').collapse('hide');
            store.dispatch('UpdateUserInfo').then( response => {
                v_main.currPage = c;
                if (c == 'home') {
                    $('#home_ul > li').removeClass('active');
                    $('#home_ul > li').first().addClass('active');
                    this.category = '全部';
                    v_main.post_category = '全部';
                    v_main.GetPosts();
                } else if (c == 'myOrder') {
                    $('#myorder_ul > li').removeClass('active');
                    $('#myorder_ul > li').first().addClass('active');
                    this.category = '向我求购'
                    v_main.order_category = 'toMe';
                    v_main.GetOrders();
                }
            }, error => {
                v_main.currPage = c;
                if (c == 'home') {
                    $('#home_ul > li').removeClass('active');
                    $('#home_ul > li').first().addClass('active');
                    this.category = '全部';
                    v_main.post_category = '全部';
                    v_main.GetPosts();
                } else if (c == 'myOrder') {
                    $('#myorder_ul > li').removeClass('active');
                    $('#myorder_ul > li').first().addClass('active');
                    this.category = '向我求购'
                    v_main.order_category = 'toMe';
                    v_main.GetOrders();
                }
            })
        }
    },
});

Vue.component('v-profile-bulletin', {
    template: `
        <div v-if="error == ''">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4><b>{{username}}</b></h4>
              <abbr v-bind:title="[detail]">{{levelName}}</abbr>
            </div>
            <div class="panel-body">
              <p>学分：{{grade}}</p>
              <p>销售成功：{{good_sell}}</p>
              <p>销售失败：{{bad_sell}}</p>
              <p>购买成功：{{good_purchase}}</p>
              <p>购买失败：{{bad_purchase}}</p>
            </div>
          </div>
        </div>
        <div v-else>
            <p>无法找到用户资料</p>
        </div>
    `,
    props: ["username"],
    data: function() {
        return {
            grade: "0",
            good_sell: "0",
            bad_sell: "0",
            good_purchase: "0",
            bad_purchase: "0",
            error : "",
            level : 0,
            level_exp_time: 0,
        };
    },
    computed: {
        levelName: function() {
            if (this.level == 0) {
                return " ";
            } else if (this.level == 1) {
                return '普通学生';
            } else if (this.level == 2) {
                return '小队长'
            } else if (this.level == 3) {
                return '中队长'
            } else if (this.level == 4) {
                return '大队长'
            } else {
                return '未知级别';
            }
        },
        detail: function() {
            var ret = "";
            
            if (store.state.levelStat) {
                ret += "发帖间隔"+store.state.levelStat[this.level]['post_gap']+"小时，学分收益"+store.state.levelStat[this.level]['benefit']+"倍，每帖最多"+store.state.levelStat[this.level]['post_limit']+"项。";

                if (this.level > 1) {
                    ret += "（剩余" + Math.round(this.level_exp_time/86400)+"天）";
                }
            }
            return ret;
        }
    },
    methods: {
        Update: function() {
            var v = this;
            $.ajax({
                url: server_url + '/userinfo',
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    username: this.username,
                }),
                success: function(msg) {
                    v.grade = msg['grades'];
                    v.good_sell = msg['good_sell'];
                    v.bad_sell = msg['bad_sell'];
                    v.good_purchase = msg['good_purchase'];
                    v.bad_purchase = msg['bad_purchase'];
                    v.level = msg['level'];
                    v.level_exp_time = msg['level_exp_time'];
                    v.error = "";
                },
                error: function(xhr) {
                    v.error = xhr['responseJSON']["msg"];
                }
            })
        }
    },
    watch: {
        username: function() {
            this.Update();
        }
    },
    mounted() {
        this.Update();
    }
})

var v_userinfo = new Vue( {
    el: '#userinfo_modal',
    computed: {
        username: function() {
            if (store) {
                return store.state.checkusername;
            } else {
                return "";
            }
        }
    }
    
})

Vue.component('v-usertag', {
    template: `
        <a role="button" @click.stop="OnClick()">{{username}}</a>
    `,
    props: ["username"],
    methods: {
        OnClick: function() {
            store.commit('SetCheckUserName', {'username':this.username});
            $('#userinfo_modal').modal('toggle');
        }
    }
})

Vue.component ('v-items', {
    props: ['items', 'post'],
    data : function() {
        orderVal = {}
        for (idx in this.items) {
            orderVal[this.items[idx]['name']] = [this.items[idx]['price'], 0];
        }
        return {
            order: orderVal,
            has_error: true,
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
        },
        totalPiece: function() {
            var piece = 0;
            for (idx in this.items) {
                var it = this.items[idx];
                if (this.order[it['name']][1] != '') {
                    piece += parseInt(this.order[it['name']][1]);
                }
            }
            return piece;

        }
    },
    methods : {
        SubmitOrder: function() {
            store.commit('SetOrder', [this.order, this.totalPrice, this.post]);
            store.dispatch('UpdateUserInfo');
        },
        OrderValid: function() {
            for (name in this.order) {
                if (parseInt(this.order[name][1]) > parseInt(this.post['availability'][name])) {
                    return false;
                }
            }
            if (this.totalPiece == 0)
                return false;
            return true;
        }
    } 
});

Vue.component ('v-post', {
    props: ['post'],
    data : function() {
        return {
            deleteConfirm : false,
            orderValid : false,
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
        },
        classObject: function() {
            return {
                bold: this.post['buff']['bold'] == true,
                red: this.post['buff']['color'] == 'red',
                green: this.post['buff']['color'] == 'green',
                blue: this.post['buff']['color'] == 'blue',
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
        UseCard: function() {
            v_card_use.SetTarget({"postid":this.post['id'], "postTitle":this.post['title']});
            $('#card_use_modal').modal('show');
        },
        SubmitOrder: function() {
            if (this.$refs.v_items[0].OrderValid()) {
                this.$refs.v_items[0].SubmitOrder();
                $('#confirm_modal').modal('toggle');
            } else {
                v_err_msg.ShowError('您没选择任何商品，或购买数量超出限额。')
            }
        },
    }
});

Vue.component ('v-order', {
    props: ['order'],
    data: function() {
        return {
            info: "",
            callback: null,
            callback_data: {},
            button_type: "btn-default",
            confirm_modal_show: true,
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
                        $('#action-confirm').modal('hide');
                        window.location.replace('/');
                    },
                    error: function(xhr) {
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
            v_confirm_action.SetAction(this.callback, this.callback_data, this.button_type, this.info);
        }
    }
});
Vue.component('v-profile', {
    data : function() {
        if (store) {
            var uname = store.state.username;
        } else {
            var uname = "";
        }
        return {
            old_password: "",
            new_password: "",
            new_password_again: "",
            password_err_msg: "",
            password_success_msg: "",
            email: "",
            cell: "",
            address: "",
            grades: "",
            good_sell: "",
            bad_sell: "",
            good_purchase: "",
            bad_purchase: "",
            info_err_msg: "",
            info_success_msg: "",
            username: uname,
        };
    },
    methods : {
        ChangePassword: function() {
            var v = this;
            if (this.new_password != this.new_password_again) {
                this.password_err_msg = "两次输入密码需一致！";
                return;
            } else {
                this.password_err_msg = "";
            }
            $.ajax({
                url: server_url + '/changepassword',
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    username: store.state.username,
                    old_password: v.old_password,
                    new_password: v.new_password,
                    new_password_again: v.new_password_again
                }),
                success: function(msg) {
                    v.old_password = v.new_password = v.new_password_again = "";
                    v.password_success_msg = "修改密码成功!"
                },
                error: function(xhr) {
                    v.password_err_msg = xhr['responseJSON']["msg"];
                }
            })
        },
        UpdateInfo: function() {
            var v = this;
            $.ajax({
                url: server_url + '/updateinfo',
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    username: store.state.username,
                    token: store.state.token,
                    email: v.email,
                    cell: v.cell,
                    address: v.address
                }),
                success: function(msg) {
                    v.info_success_msg = "修改资料成功!";
                    v.info_err_msg = "";
                    store.dispatch("UpdateUserInfo");
                },
                error: function(xhr) {
                    v.info_success_msg = "";
                    v.info_err_msg = xhr['responseJSON']["msg"];
                }
            })
        }
    },
    mounted() {
        this.email = store.state.email;
        this.cell = store.state.cell;
        this.address = store.state.address;
    }
});


Vue.component('v-shop', {
    data : function() {
        if (store) {
            var uname = store.state.username;
        } else {
            var uname = "";
        }

        return {
            username: uname,
            cards: []
        }
    },
    methods: {
        PurchaseCard: function(cardName) {
            var v = this;
            $.ajax({
                url: server_url + '/purchasecard',
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    username: store.state.username,
                    token: store.state.token,
                    cardname: cardName,
                }),
                success: function(msg) {
                    store.dispatch("UpdateUserInfo");
                    v.Update();
                },
                error: function(xhr) {
                }
            })
        },
        GetCardList: function() {
            var v = this;
            $.ajax({
                url: server_url + '/getcardlist',
                method: 'POST',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=UTF-8',
                success: function(msg) {
                    v.cards = msg;
                },
                error: function(xhr) {
                }
            })
        },
        Update: function() {
            this.$refs.profile.Update();
        }
    },
    created() {
        this.GetCardList()
    }
})

var v_main = new Vue( {
    el: '#main_content',
    store,
    data : {
        currPage: "home",
        post_category: "全部",
        order_category: "toMe",
        firstPageNum: 1,
        lastPageNum: 5,
        currPageNum: 1,
        posts:[],
        orders:[],
        isLoading: false,
    },
    computed: {
        isLogin: function() {
            return this.$store.state.isLogin;
        },
        categories: function() {
            return store.state.categories;
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
                        "username": this.$store.state.username,
                        "token": this.$store.state.token,
                        "start": 10*(v.currPageNum - 1),
                        "end": 10*(v.currPageNum)
                    };
                } else {
                    v.posts = [];
                    v.isLoading = false;
                    return;
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
                    v.isLoading = false;
                },
                error: function(msg) {
                    v.isLoading = false;
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
                    }
                    v.orders = JSON.parse(JSON.stringify(msg));
                    v.isLoading = false;
                },
                error: function(xhr) {
                    v.isLoading = false;
                },
                statusCode: {
                    401: function() {
                        store.dispatch("CheckTokenValid");
                    }
                }
            })
        },
        ChangePageNum: function(pageNum) {
            this.isLoading = true;
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
        ClickTab: function(category) {
            $('#side-collapse').collapse('hide');
            this.isLoading = true;
            if (this.currPage == 'home') {
                this.post_category = category;
                v_nav.category = category;
                this.GetPosts();
            } else if (this.currPage == 'myOrder') {
                this.order_category = category;
                if (category == "toMe") {
                    v_nav.category = '向我求购';
                } else if (category == 'fromMe') {
                    v_nav.category = '我的购买';
                }
                this.GetOrders();
            }
        },
    },
    mounted() {
        store.dispatch('GetLevelStat');
        store.dispatch('UpdateUserInfo').then(response => {
            this.GetPosts();
        }, error => {
            this.GetPosts();
        });
        $('#home_ul > li').removeClass('active');
        $('#home_ul > li').first().addClass('active');
    }
});


UpdateFileUpload = function() {
    var d = new Date();
    var t = d.getTime();
    var data = {
        "timestamp": t,
        "callback": "/cloudinary_cors.html",
        "api_key": "588985454677234",
    };
    $.ajax({
        url: server_url + '/signature',
        method: 'POST',
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(data),
        success: function(msg) {
            data["signature"] = msg["signature"];
            $(".cloudinary-fileupload").attr("data-form-data", JSON.stringify(data))
            $("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
            $('.cloudinary-fileupload').bind('fileuploadprogress', function(e, data) {
                $('.progress-bar').css('width', Math.round((data.loaded * 100.0)/data.total) + '%');
            });
            $('.cloudinary-fileupload').bind('fileuploaddone', function(e, data) {
                console.log(e);
                console.log(data);
                var path = data['result']['secure_url'];
                console.log(path)
                v_new_post.AddImage(path);
            });
        },
        error: function(xhr) {
            console.errors("failed to get signature")
        },
    })
}
$(function() {
  if($.fn.cloudinary_fileupload !== undefined) {
    UpdateFileUpload();
  }
});
