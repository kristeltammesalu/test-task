/**
 * Created by Kristel on 4.10.2015.
 */


var api_token = 'c5c94b4b053bc595e19c21a2301e317beb837664';

$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    options.url = 'https://api.pipedrive.com/v1' + options.url + '?api_token=' + api_token;
});

var Persons = Backbone.Collection.extend({
    url: '/persons',

    parse: function( resp ){

        return resp.data;
    }
});

var Person = Backbone.Model.extend({
    urlRoot: '/persons',

    parse: function( resp ){
        return resp.data;
    }
});

var Deal = Backbone.Model.extend({

});

var Deals = Backbone.Collection.extend({
    model: Deal,
    initialize: function(options) {
        this.person_id = options.id;
    },

    url: function () {
        return '/persons/' + this.person_id + '/deals';
    },

    parse: function (response) {
        return response.data;
    }
});

var PersonListView = Backbone.View.extend({
    el: '.list-group',
    render: function () {
        var that = this;
        var persons = new Persons();
        persons.fetch({
            success: function (persons) {
                var template = _.template($("#person-list-template").html());
                that.$el.html(template({persons: persons.toJSON()}));
            }
        });
    }
});

var personListView = new PersonListView();

var DealsView = Backbone.View.extend({
    el: $('.deals'),
    render: function (options) {
        var that = this;
        var deals = new Deals({id: options.id});
        deals.fetch({
            success: function (deals) {
                var template = _.template($("#deals-template").html());
                that.$el.html(template({deals: deals.toJSON()}));
            }
        });
    }
});

var PersonDetailView = Backbone.View.extend({
    el: '.bold-ul',
    template: _.template($('#person-template').html()),

    render: function (options) {
        var that = this;
        var person = new Person({id: options.id});

        person.fetch({
            success: function(person) {

                var added = moment(person.get('add_time')).format("MMMM D, YYYY");
                
                if(!person.get('next_activity_date')) {
                    person.set('next_activity_date', '-');
                } else {
                    var next_act_date = moment(person.get('next_activity_date')).calendar();
                    person.set('next_activity_date', next_act_date);
                }

                if(!person.get('last_activity_date')) {
                    person.set('last_activity_date', '-');
                } else {
                    var last_act_date = moment(person.get('last_activity_date')).fromNow();
                    person.set('last_activity_date', last_act_date);
                }

                person.set('add_time', added);

                $(that.el).html(that.template({ person: person.toJSON() }));
            }
        });
    }
});

var PersonNameView = Backbone.View.extend({
    el: '.person-main-name',
    template: _.template($('#person-name-template').html()),

    render: function (options) {
        var that = this;
        var person = new Person({id: options.id});

        person.fetch({
            success: function(person) {
                $(that.el).html(that.template({ person: person.toJSON() }));
            }
        });
    }
});

var personDetailView = new PersonDetailView();
var personNameView = new PersonNameView();
var dealsView = new DealsView();

var Router = Backbone.Router.extend({
    routes: {
        "": "home",
        "persons/:id": "person",
        "persons/:id/deals": "person"
    }
});
var router = new Router();
router.on('route:home', function() {
    // render user list
    personListView.render();
});

router.on('route:person', function(id) {
    personListView.render();
    personDetailView.render({id: id});
    personNameView.render({id: id});
    dealsView.render({id: id});
});

Backbone.history.start();


