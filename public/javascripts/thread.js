var threadModule = angular.module('thread', ['board', 'post']);

threadModule.config(['$stateProvider', function($stateProvider){
	$stateProvider
		.state('createThread', {
			url: '/create-thread?categoryId',
			views: {
				'navbar': {
						templateUrl: './partials/navbar.html'
					},
				'body': {
					templateUrl: './partials/thread.html',
					controller: 'createThreadCtrl',
				},
				'create-thread@createThread': {
					templateUrl: './partials/thread.create.html',
				}
			},
			resolve: {
				category: ['$stateParams', 'categoryFactory', function($stateParams, categoryFactory){
					return categoryFactory.getSingleCategory($stateParams.categoryId)
				}]
			}
		})
		.state('threadById', {
			url: '/view-thread/{threadId}',
			views: {
				'navbar': {
						templateUrl: './partials/navbar.html'
					},
				'body': {
					templateUrl: './partials/thread.html',
					controller: 'basicThreadCtrl',
				},
				'view-thread@threadById': {
					templateUrl: './partials/thread.view.html',
				}
			},
			resolve : {
				thread : ['$stateParams', 'threadFactory', function($stateParams, threadFactory){
					return threadFactory.getThread($stateParams.threadId);
				}]
			}
		});
}]);

threadModule.factory('threadFactory', ['$http', function($http){
	var threadObject = {
		threadJSON : []
	}

	threadObject.createThread = function(thread, callback){
		return $http.post('/api/thread', thread).success(function(data){
			callback(data);
		})
		.error(function(error){
			console.log(error);
		});
	}

	threadObject.getThread = function(threadId){
		return $http.get('/api/thread/' + threadId).success(function(data){
			return data;
		});
	}

	return threadObject;
}]);

threadModule.controller('createThreadCtrl', ['$scope', '$location', 'threadFactory', 'postFactory', 'category', function($scope, $location, threadFactory, postFactory, category){
	$scope.category = category.data;
	$scope.newThread = {};
	$scope.newPost = {};
	$scope.createThread = function(){
		$scope.newThread.parent = $scope.category;
		threadFactory.createThread($scope.newThread, function(data){
			$scope.newPost.parent = data;
			console.log($scope.newPost.createdBy);
			postFactory.createPost($scope.newPost, function(data){
				// TODO: We want to redirect on success
			});
		});
	}
}]);

threadModule.controller('basicThreadCtrl', ['$scope', '$stateParams', 'categoryFactory', 'threadFactory', 'postFactory', 'thread', function($scope, $stateParams, categoryFactory, threadFactory, postFactory, thread){
	var promise = categoryFactory.getSingleCategory(thread.data.parent._id);
	promise.then(function(result){
		$scope.thread = thread.data;
		$scope.category = result.data;
		console.log($scope.thread);
	});
	$scope.newPost = {};
	$scope.createPost = function(){

	}

	$scope.replacePostLf = function(post){
		return post.replace('\n', '<br /><br />');
	}
}]);
