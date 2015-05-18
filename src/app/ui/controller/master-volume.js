'use strict';

var $ = require( "jquery" ),
	settingsConvertor = require( "settings-convertor" );

module.exports = function( mod ) {

	mod.controller( "MasterVolumeCtrl", [ "$scope", "dawEngine", "patchLibrary", function( $scope, dawEngine, patchLibrary ) {
		var self = this,
			settingsChangeHandler = function( newValue, oldValue ) {
				if ( newValue === oldValue ) {
					return;
				}

				dawEngine.masterVolumeSettings = {
					level: settingsConvertor.transposeParam( self.level, settings.level.range )
				};

				patchLibrary.preserveUnsaved( dawEngine.getPatch() );
			},
			settings = dawEngine.masterVolumeSettings;

		self.level = settingsConvertor.transposeParam( settings.level, [ 0, 100 ] );

		[
			"masterVolume.level.value"
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