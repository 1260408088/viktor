'use strict';

var $ = require( "jquery" );

module.exports = function( mod ) {

	mod.controller( "MasterVolumeCtrl", [ "$scope", "dawEngine", function( $scope, dawEngine ) {
		var self = this,
			settingsChangeHandler = function() {
				dawEngine.masterVolumeSettings = {
					level: self.level
				};
			},
			settings = dawEngine.masterVolumeSettings;

		self.level = settings.level;

		[
			"masterVolume.level"
		].forEach( function( path ) {
			$scope.$watch( path, settingsChangeHandler );
		} );

		// fix the lack of attr 'value' update
		$( ".master-volume webaudio-knob" ).on( "change", function( e ) {
			if ( parseFloat( $( e.target ).attr( "value" ) ) !== e.target.value ) {
				$( e.target ).attr( "value", e.target.value );
			}
		} );

	} ] );

	mod.directive( "masterVolume", [ "$templateCache", function( $templateCache ) {
		return {
			restrict: "E",
			replace: true,
			template: $templateCache.get( "master-volume.html" )
		};
	} ] );

};