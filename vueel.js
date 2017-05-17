var v_register = new Vue( {
    el: '#register',
    data: {
        isLogin: false,
        username: 'gaotian'
    }
});

var v_confirm = new Vue( {
    el: '#confirm_modal',
    data: {
        title: "title",
        items: [["item1", 2.5, 2], ["item2", 2.5, 1]],
        totalPrice: 7.5
    }
});

var v_nav = new Vue ( {
    el: '#top_nav',
    methods : {
        ChangeContent: function(c) {
            v_main.currPage = c;
        }
    }
});

var v_page = new Vue( {
    el: '#foot_page',
    data: {
        firstPageNum : 1,
        totalPageNum : 3,
    }
});

var fake_posts = [
    {title: "post1", author:"author1", expire_time:"1", content:"abcd", items:{"item1":1, "item2":2.2}},
    {title: "post2", author:"author2", expire_time:"1", content:"ajcd", items:{"item11":1.01, "item21":2.09}},
    {title: "post3", author:"author3", expire_time:"1", content:"akcd", items:{"item1":221, "item2":212}},
    {title: "post4", author:"author4", expire_time:"1", content:"alcd", items:{"item111":1, "item2241":2.10}},
    {title: "post5", author:"author5", expire_time:"1", content:"abjd", items:{"item1":12, "item23":2}}
];

var v_posts = new Vue( {
    el: '#posts_div',
    data: {
        posts: fake_posts
    },
    methods: {
        ToggleDisplay: function() {
            posts=[];
            console.log("123");
        }
    }
})

var v_main = new Vue( {
    el: '#main_content',
    data : {
        counter :1,
        currPage: "home"
    }
});
