module.exports = function(db) {
	return {
		getLinks: function(options, callback) {
			options = options || {};
			options.page = options.page || 0;
			options.limit = options.limit || 25;

			db.getLinks({filter: options.filter,
						limit: [options.limit * options.page, options.limit],
						user: options.user ? options.user : null,
						where: options.where ? options.where : null
					},
					function(err, links) {
				if (err) {
					console.error(err);
					callback([], []);
					return;
				}
				
				
				var index = 0;
				var formatter = require('./timeformatter');
				var getLinkData = function() {
					links[index].antiquity = formatter.antiquity(links[index].timestamp);
					links[index].href = '/r/'+links[index].category_ref+'/'+links[index].alphaid+'/'+links[index].ref;
					db.getLinkCommentCount(links[index].id, function(err, comments) {
						links[index].comments = {'length': comments[0].count};
						if (links[index].fbpost) {
							var split = links[index].fbpost.split('_');
							links[index].fbpost = {page: split[0], post: split[1]};
						}
						index++;
						if (index < links.length) {
							getLinkData();
						} else {
							db.getLinkCount(options, function(err, count) {
								if (err) throw err;
								var count = Math.ceil(count[0].count / options.limit);
								var pages = [];
								for(var i = 0; i < count; i++) {
									pages.push({num: i+1, active: i == options.page});
								}
								callback(links, pages);
							});
						}
					});
				};
				if (links.length > 0) {
					getLinkData();
				} else {
					callback(links, []);
				}
			});
		}
	}
};