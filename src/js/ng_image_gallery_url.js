/**
 * Direktíva zabezpečujúca načítanie obrázka cez xhr aby tento request prešiel rovnakým zabezpečením ako všetky ostatné
 */
(function () {
	angular.module('thatisuday.ng-image-gallery')
		.directive('ngImageGalleryUrl', ['$http', '$q', '$compile',
				function ($http, $q, $compile) {
					return {
						restrict: 'A',
						link: function (scope, elem, attrs) {
                            NgImageGalleryUrl($http, $q, $compile, scope, elem, attrs);
						}
					};
				}
			]
		);

	function NgImageGalleryUrl($http, $q, $compile, imageScope, imageElement, attrs) {
		//NOTE: NgImageGalleryUrl je veľkým lebo sa k tomu viac správam ako k triede než k funkcií
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

			attrs.$observe('ngImageGalleryUrl', imageUrlObserver);
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
				if (imageElement[0].nodeName === 'DIV') {
					//Ak je element, na ktorom je direktiva 'DIV', jedna sa o thumb a teda ponechavam povodnu logiku
					// ng-image-gallery pre thumb (v direktive showImageAsync)
                    imageElement.css({ backgroundImage: 'url("' + imageBlobUrl + '")' });
                    imageElement.empty();
                } else {
                    imageElement.attr('src', imageBlobUrl);
				}
			} else {
				replaceWithDefaultImage(imageElement, imageScope);
			}
		}
	}


})();