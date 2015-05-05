'use strict';

function MIDIController() {
	var self = this;

	self.messageHandler = null;
}

MIDIController.prototype = {

	init: function( callback ) {
		var self = this,
			requestMIDIAccess = navigator.requestMIDIAccess;

		if ( requestMIDIAccess ) {
			requestMIDIAccess.bind( navigator )().then(
				self.onMidiAccess.bind( self, callback ),
				function( error ) {
					console.log( error );
					callback();
				}
			);
		} else {
			console.log( "Midi API is unavailable in this browser." );
			callback();
		}
	},

	onMidiAccess: function( callback, midiAccess ) {
		var self = this,
			inputs = midiAccess.inputs,
			midiMessageHandler = self.onMidiMessage.bind( self ),
			noDevicesMessage = "No MIDI devices are connected.";

		if ( "function" === typeof inputs ) {
			// first case is a deprecated old way
			inputs = inputs();

			if ( inputs.length === 0 ) {
				callback( noDevicesMessage );
			} else {
				for ( var i = 0; i < inputs.length; i++ ) {
					inputs[ i ].onmidimessage = midiMessageHandler;
				}
			}
		} else {
			// ... the current API
			inputs = inputs.values();

			var input = inputs.next(),
				predicate = function(x) { return x && !x.done; },
				hasDevices = predicate( input );

			while ( predicate( input ) ) {
				input.value.onmidimessage = midiMessageHandler;
				input = inputs.next();
			}

			if ( !hasDevices ) {
				console.log( noDevicesMessage );
			}
			callback();

		}
	},

	setMessageHandler: function( func ) {
		var self = this;

		self.messageHandler = func;
	},

	onMidiMessage: function( event ) {
		var self = this,
			parsed = self.parseEventData( event ),
			type = parsed ? ( parsed.isPitchBend ? "pitchBend" : "notePress" ) : "other";

		self.messageHandler(
			type,
			parsed,
			event
		);
	},

	parseEventData: function( event ) {

		if ( !event || !event.data || !event.data.length || event.data.length < 3 ) {
			throw new Error( "Unreadable MIDI message." );
		}

		var firstByte = event.data[ 0 ],
			secondByte = event.data[ 1 ],
			thirdByte = event.data[ 2 ],
			binary = function( string ) {
				return parseInt( string, 2 );
			},
			noteFrequency = function( number ) {
				return 440 * Math.pow( 2, ( number - 69 ) / 12 );
			},
			isPitchBend = false,
			isNoteOn = false,
			parsed = false,
			pitchBend;

		// 10011111 & 11110000 = 10010000
		firstByte = firstByte & binary( "11110000" );

		if ( firstByte === binary( "10010000" ) ) {
			if ( thirdByte !== 0 ) {
				isNoteOn = true;
			}
			parsed = true;
		} else if ( firstByte === binary( "11100000" ) ) {
			isPitchBend = true;
			pitchBend = ( ( thirdByte * 128 + secondByte ) - 8192 ) / 8192;
			parsed = true;
		} else if ( firstByte === binary( "10000000" ) ) {
			parsed = true;
		}

		return parsed ? {
			isPitchBend: isPitchBend,
			pitchBend: pitchBend,
			isNoteOn: isNoteOn,
			noteFrequency: noteFrequency( secondByte ),
			velocity: thirdByte
		} : null;
	}

};

module.exports = MIDIController;