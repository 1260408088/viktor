'use strict';

var angular = require( "angular" ),
	template = require( "./view/template/synth.html" ),
	mod = angular.module( "synth", [
		template.name
	] );

mod.directive( "synth", [ "$templateCache", function( $templateCache ) {
	return {
		restrict: "E",
		replace: true,
		template: $templateCache.get( template.name )
	};
} ] );

// Controllers
require( "./view/controller/oscillator-bank" )( mod );

module.exports = mod;