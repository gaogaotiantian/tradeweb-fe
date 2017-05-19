var server_url = "http://localhost:8000";
const store = new Vuex.Store( {
    state : {
        isLogin: true,
        username: 'gt',
        token: '',
        currOrder: {},
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
            state.totalPrice = totalPrice
        },
        Logoff (state) {
            state.isLogin = false;
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
            store.commit('Logoff');
        }
    }
});

var v_confirm = new Vue( {
    el: '#confirm_modal',
    data: {
        title: "title",
    },
    computed: {
        order: function() {
            return store.state.currOrder;
        },
        totalPrice: function() {
            return store.state.totalPrice;
        }
    }
});

var v_login = new Vue( {
    el: '#login_modal',
    data: {
        signup_username: "",
        signup_password: "",
        signup_password_again: ""

    },
    methods: {
        Register: function() {
            console.log("reg")
            $.ajax({
                url: server_url+"/register",
                method: "POST",
                dataType: "json",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"username": this.signup_username, "password": this.signup_password}),
            })
            .done(function(msg) {
                alert("Done!");
                console.log(msg);
            })
            .fail(function(msg) {
                console.log(msg)
            });
        }
    }
}) 

var v_nav = new Vue ( {
    el: '#top_nav',
    methods : {
        ChangeContent: function(c) {
            v_main.currPage = c;
        }
    }
});

Vue.component('foot-page-nav', {
    data: function() {
        return {
            firstPageNum : 1,
            totalPageNum : 3,
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
    props: ['items'],
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
            price = 0;
            for (idx in this.items) {
                item = this.items[idx];
                if (this.order[item['name']][1] == '') {
                    num = 0;
                } else {
                    num = parseInt(this.order[item['name']][1]);
                    if (isNaN(num)) {
                        return ""
                    }
                    price += parseFloat(item['price']) * parseInt(this.order[item['name']][1]);
                }
            }
            return price.toFixed(2);
        }
    },
    methods : {
        SubmitOrder: function() {
            store.commit('SetOrder', [this.order, this.totalPrice]);
        }
    } 
});
var v_main = new Vue( {
    el: '#main_content',
    data : {
        currPage: "home",
        posts: fake_posts
    },
    methods: {
        ToggleDisplay: function(post) {
            if (post['is_display'] == false) {
                for (var i = 0; i < this.$data.posts.length; i++) {
                    this.$data.posts[i]['is_display'] = false;
                }
                post['is_display'] = true;
            } else {
                post['is_display'] = false;
            }
        }
    }
});
