var categoryElements = angular.module("category", []);

categoryElements.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
$stateProvider
		.state('category',{
			url: '/category/{id}',
			views : {
				'navbar' : {
					templateUrl: './partials/navbar.html'
				},
				'body' : {
					templateUrl: './partials/category.html',
					controller: 'categoryCtrl',
					resolve: {
						category: ['$stateParams', 'categoryFactory', function($stateParams, categoryFactory) {
							return categoryFactory.getSingleCategory($stateParams.id);
						}]
					}
				},
				'modal-register' : {
					templateUrl: './partials/modal_register.html',
				}
			}
		});
}]);

categoryElements.controller('categoryCtrl', ['$scope', 'categoryFactory', 'category', function($scope, categoryFactory, category){
	$scope.category = category.data;
	console.log($scope.category)
}]);

categoryElements.factory('User', function(){
	var user = null;

	return {
		getUser: function(){
			return user;
		},
		setUser: function(newUser){
			user = newUser;
		}
	};
});
