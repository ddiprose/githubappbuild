(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var urls = require('../constants/urlConstants');
var repoListingStore = require('../stores/repoListingStore');

var controller = function() {
    this.userName = m.route.param('userName');
    this.repoName = m.route.param('repoName');
};

var view = function(ctrl) {
    var homeLink = m('a[href=/].header-logo-invertocat', {config: m.route}, [
        m('span.mega-octicon.octicon-mark-github'),
        m('span.title', ' Github')
    ]);

    return m('.row.header', [
        m('.col-md-8.header-left',
            homeLink
        ),
        m('.col-md-4.header-right', [
            m('span',
                ctrl.userName ?
                m('a[href=' + urls.userUrl(ctrl.userName) + ']', {config: m.route}, ctrl.userName) : ''
            ),
            m('span',
                ctrl.repoName ?
                ' / ' + ctrl.repoName : ''
            )
        ])
    ]);
};

module.exports = {controller: controller, view: view};

},{"../constants/urlConstants":6,"../stores/repoListingStore":13}],2:[function(require,module,exports){
var urls = require('../constants/urlConstants');
var repoDetailStore = require('../stores/repoDetailStore');

var controller = function() {
    this.userName = m.route.param('userName');
    this.repoName = m.route.param('repoName');
    this.languages = repoDetailStore.getLanguages(this.userName, this.repoName);
};

var pieChartConfig = function(data) {
    data = _.pairs(data).map(function(item) {
        return {
            label: item[0],
            value: item[1]
        };
    });
    return function(element, isInitialized, context) {
        if(!isInitialized) {
            nv.addGraph(function() {
                var chart = nv.models.pieChart()
                  .x(function(d) { return d.label; })
                  .y(function(d) { return d.value; })
                  .showLabels(true);

                d3.select(element)
                    .datum(data)
                    .transition().duration(350)
                    .call(chart);

                return chart;
            });
        }
    };
};

var view = function(ctrl) {
    var languages = ctrl.languages;
    var repoUrl = 'https://github.com/' + ctrl.userName + '/' + ctrl.repoName;

    var wrapper = function(content) {
        return m('.col-md-12', [
            m('a[href=' + urls.userUrl(ctrl.userName) + ']', {config: m.route}, 'back'),
            content
        ]);
    };

    if(languages.error()) {
        return wrapper(m('div', languages.error()));
    }

    if(!languages.ready()) {
        return wrapper(m('div', m('img', {src: '/images/ajax-loader.gif'})));
    }

    return wrapper([
        m('h3', ctrl.userName + ' / ' + ctrl.repoName),
        m('div',
            m('a[href=' + repoUrl + '][target=_blank]', 'View on GitHub')
        ),
        m('div',
            m('svg.repos', {config: pieChartConfig(languages.data())})
        )
    ]);
};

module.exports = {controller: controller, view: view};

},{"../constants/urlConstants":6,"../stores/repoDetailStore":12}],3:[function(require,module,exports){
var urls = require('../constants/urlConstants');
var repoListingStore = require('../stores/repoListingStore');

var controller = function() {
    this.userName = m.route.param('userName');
    this.repositories = repoListingStore.getRepositories(this.userName);
};

var view = function(ctrl) {
    var repositories = ctrl.repositories;

    var wrapper = function(content) {
        return m('.col-md-12', [
            m('a[href=' + urls.homeUrl() + ']', {config: m.route}, 'back'),
            content
        ]);
    };

    if(repositories.error()) {
        return wrapper(m('div', repositories.error()));
    }

    if(!repositories.ready()) {
        return wrapper(m('div', m('img', {src: '/images/ajax-loader.gif'})));
    }

    return wrapper([
        m('h3', ctrl.userName + '\'s repositories'),
        m('ul.repos',
            repositories.data().map(function(repo) {
                return m('li', [
                    m('a[href=/' + ctrl.userName + '/' + repo.name + ']', {config: m.route}, repo.name),
                    ' ',
                    m('a[href=' + repo.html_url + '][target=_blank].pull-right', 'View on GitHub'),
                    m('div',
                        _.filter([
                            repo.language, repo.description
                        ],
                        function(prop) { return prop; }).join(', ')
                    )
                ]);
            })
        )
    ]);
};

module.exports = {controller: controller, view: view};

},{"../constants/urlConstants":6,"../stores/repoListingStore":13}],4:[function(require,module,exports){
var urls = require('../constants/urlConstants');
var repoListingStore = require('../stores/repoListingStore');

var bindEnterKey = function(callback) {
    return function(e) {
        if (e.keyCode == 13) {
            return callback();
        }
        return true;
    };
};

var controller = function() {
    this.user = m.prop('');

    this.selectUser = function() {
        m.route(urls.userUrl(this.user()));
    };
};

var view = function(ctrl) {
    return m('.col-md-6', [
        m('h3', 'User name'),
        m('.input-group', [
            m('input.form-control', {
                placeholder: 'Enter a GitHub user name',
                oninput: m.withAttr('value', ctrl.user),
                onkeydown: bindEnterKey(ctrl.selectUser.bind(ctrl)),
                value: ctrl.user()
            }),
            m('span.input-group-btn',
                m('button.btn.btn-default', {onclick: ctrl.selectUser.bind(ctrl)}, 'Go')
            )
        ])
    ]);
};

module.exports = {controller: controller, view: view};

},{"../constants/urlConstants":6,"../stores/repoListingStore":13}],5:[function(require,module,exports){
var base = 'https://api.github.com';

module.exports = {
    reposUrl: function(userName) {
        return base + '/users/' + userName + '/repos';
    },
    repoLanguagesUrl: function(userName, repoName) {
        return base + '/repos/' + userName + '/' + repoName + '/languages';
    }
};

},{}],6:[function(require,module,exports){
var base = '';

module.exports = {
    homeUrl: function(userName) {
        return base + '/';
    },
    userUrl: function(userName) {
        return base + '/' + userName;
    },
    repoUrl: function(userName, repoName) {
        return base + '/' + userName + '/' + repoName;
    }
};

},{}],7:[function(require,module,exports){
var pages = {
    home: require('./pages/home'),
    user: require('./pages/user'),
    repo: require('./pages/repo')
};

m.route(document.getElementById('main'), '/', {
    '/': pages.home,
    '/:userName': pages.user,
    '/:userName/:repoName': pages.repo
});

},{"./pages/home":9,"./pages/repo":10,"./pages/user":11}],8:[function(require,module,exports){
var requestWithFeedback = function(args, prop) {
    var nonJsonErrors = function(xhr) {
        return xhr.status > 200 ? JSON.stringify(xhr.responseText) : xhr.responseText;
    };
    var error = prop ? prop.error : m.prop();
    var data = prop ? prop.data : m.prop();
    var completed = prop ? prop.ready : m.prop();

    error('');
    completed(false);

    var complete = function(d) {
        data(d);
        completed(true);
    };
    var fail = function(d) {
        error(d);
        m.redraw();
    };
    args.background = true;
    args.extract = nonJsonErrors;
    args.config = function(xhr) {
        xhr.timeout = 4000;
        xhr.ontimeout = function() {
            complete();
            error('timeout');
            m.redraw();
        };
        if(args.xhrConfig) {
            args.xhrConfig(xhr);
        }
    };
    var done = complete;
    m.request(args).then(done, fail).then(m.redraw);
    return prop || {
        error: error,
        data: data,
        ready: completed
    };
};

module.exports = requestWithFeedback;

},{}],9:[function(require,module,exports){
var header = require('../components/header');
var search = require('../components/search');

var controller = function() {
    this.headerController = new header.controller();
    this.homeController = new search.controller();
};

var view = function(ctrl) {
    return [
        header.view(ctrl.headerController),
        m('.row', search.view(ctrl.homeController))
    ];
};

module.exports = {controller: controller, view: view};

},{"../components/header":1,"../components/search":4}],10:[function(require,module,exports){
var header = require('../components/header');
var repo = require('../components/repoDetail');

var controller = function() {
    this.headerController = new header.controller();
    this.repoController = new repo.controller();
};

var view = function(ctrl) {
    return [
        header.view(ctrl.headerController),
        m('.row', repo.view(ctrl.repoController))
    ];
};

module.exports = {controller: controller, view: view};

},{"../components/header":1,"../components/repoDetail":2}],11:[function(require,module,exports){
var header = require('../components/header');
var repoListing = require('../components/repoListing');

var controller = function() {
    this.headerController = new header.controller();
    this.repoListingController = new repoListing.controller();
};

var view = function(ctrl) {
    return [
        header.view(ctrl.headerController),
        m('.row', repoListing.view(ctrl.repoListingController))
    ];
};

module.exports = {controller: controller, view: view};

},{"../components/header":1,"../components/repoListing":3}],12:[function(require,module,exports){
var svc = require('../constants/svcConstants');
var requestWithFeedback = require('../helpers/requestWithFeedback');

var languages = {
    error: m.prop(''),
    data: m.prop(),
    ready: m.prop(false)
};

var getLanguages = function(userName, repoName) {
    var options = {method: 'GET', url: svc.repoLanguagesUrl(userName, repoName)};
    return requestWithFeedback(options, languages);
};

module.exports = {
    getLanguages: getLanguages,
    repository: languages
};

},{"../constants/svcConstants":5,"../helpers/requestWithFeedback":8}],13:[function(require,module,exports){
var svc = require('../constants/svcConstants');
var requestWithFeedback = require('../helpers/requestWithFeedback');

var repositories = {
    error: m.prop(''),
    data: m.prop(),
    ready: m.prop(false)
};

var getRepositories = function(userName) {
    var options = {method: 'GET', url: svc.reposUrl(userName)};
    return requestWithFeedback(options, repositories);
};

module.exports = {
    getRepositories: getRepositories,
    repositories: repositories
};

},{"../constants/svcConstants":5,"../helpers/requestWithFeedback":8}]},{},[7])