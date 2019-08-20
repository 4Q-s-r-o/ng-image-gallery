/**
 * Direktíva zabezpečujúca načítanie obrázka cez xhr aby tento request prešiel rovnakým zabezpečením ako všetky ostatné
 * data-image-url : url obrázka, ktorá by normálne patrila do img src
 * data-default-image : url lokálneho obrázka, ktorý sa použije ako default keď sa hlavný nepodarí natiahnuť
 * [default 'images/no-image.png']
 * data-dafault-image-class : classa, ktorá je priradená elementu default imagu - umožnuje custom styling
 * [default 'default-image']
 */
(function () {
	angular.module('thatisuday.ng-image-gallery')
		.directive('imageUrl', ['$http', '$q', '$compile',
				function ($http, $q, $compile) {
					return {
						restrict: 'A',
						link: function (scope, elem, attrs) {
							ImageUrl($http, $q, $compile, scope, elem, attrs);
						}
					};
				}
			]
		);

	function ImageUrl($http, $q, $compile, imageScope, imageElement, attrs) {
		//NOTE: ImageUrl je veľkým lebo sa k tomu viac správam ako k triede než k funkcií
		var defaultImage = {
			src: 'images/no-image.png',
			cssClass: 'default-image'
		};

		initialize();

		/**
		 * Inicializačná funkcia
		 */
		function initialize() {
			if (CommonUtils.isDefined(attrs.defaultImage)) {
				defaultImage.src = attrs.defaultImage;
			}

			if (CommonUtils.isDefined(attrs.defaultImageClass)) {
				defaultImage.cssClass = attrs.defaultImageClass;
			}

			attrs.$observe('imageUrl', imageUrlObserver);
		}

		/**
		 * Observer, ktorý sa vyvolá vždy pri zmene adresy obrázka
		 * @param url Nová url obrázka
		 */
		function imageUrlObserver(url) {

			imageElement.removeClass("ng-hide");
			imageElement.parent().find('.' + defaultImage.cssClass).remove();

			var configObject = {
				method: 'GET',
				url: url,
				responseType: 'blob',
				errorHandling: {
					all: replaceWithDefaultImage
				},
				withCredentials: true
			};

			$http(configObject).then(imageLoad, CommonUtils.emptyFunction);
		}

		/**
		 * Nahradenie obrázku za defaultný ak sa nenašiel obrázok na serveri
		 */
		function replaceWithDefaultImage() {
			var defaultImageTemplate = '<img src="' + defaultImage.src + '" class="' + defaultImage.cssClass + '">';
			var defaultImageElement = angular.element(defaultImageTemplate);

			//NOTE: používame natvrdo styl na štýlovanie veľkosti obrázkov preto ho kopírujem aj pre default
			defaultImageElement[0].style.cssText = imageElement[0].style.cssText;
			defaultImageElement[0].classList = imageElement[0].classList;
			imageElement.after($compile(defaultImageElement[0])(imageScope));
			imageElement.addClass("ng-hide");
		}

		/**
		 * Funkcia ktorá sa spustí, keď príde odpoveď zo servera na request obrázku
		 * @param response Odpoveď servera
		 */
		function imageLoad(response) {
			if (response.status === 200) {
				var blob = response.data;
				var imageBlobUrl = URL.createObjectURL(blob);
				imageElement.attr('src', imageBlobUrl);
			} else {
				replaceWithDefaultImage(imageElement, imageScope);
			}
		}
	}


})();