var sowb = window.sowb || {};

( function($){
	if( typeof FLBuilder !== 'undefined') {
		sowb.orig_FLBuilder_getSettings = FLBuilder._getSettings;

		/**
		 * Replace Beaver Builder's form data collection function with our modified version.
		 */
		FLBuilder._getSettings = function(form) {
			FLBuilder._updateEditorFields();
			form.find('.siteorigin-widget-input');
			var data     	= form.serializeArray(),
				i        	= 0,
				k        	= 0,
				value	 	= '',
				name     	= '',
				key      	= '',
				keys      	= [],
				matches	 	= [],
				settings 	= {};

			// Loop through the form data.
			for ( i = 0; i < data.length; i++ ) {

				value = data[ i ].value.replace( /\r/gm, '' );

				// Don't save text editor textareas.
				if ( data[ i ].name.indexOf( 'flrich' ) > -1 ) {
					continue;
				}
				// Support foo[]... setting keys.
				else if ( data[ i ].name.indexOf( '[' ) > -1 ) {

					name 	= data[ i ].name.replace( /\[(.*)\]/, '' );
					key  	= data[ i ].name.replace( name, '' );
					keys	= [];
					matches = key.match( /\[[^\]]*\]/g );

					// Remove [] from the keys.
					for ( k = 0; k < matches.length; k++ ) {

						if ( '[]' == matches[ k ] ) {
							continue;
						}

						keys.push( matches[ k ].replace( /\[|\]/g, '' ) );
					}


					var f = function(object, val, head, tail) {
						if( tail.length == 0) {
							object[ head ] = val;
						} else {
							if( 'undefined' == typeof object [ head ] ) {
								object [ head ] = {};
							}
							f(object[ head ], val, tail.shift(), tail);
						}
					};

					if(keys.length > 0) {

						var keysCopy = keys.slice();
						if ( 'undefined' == typeof settings[ name ] ) {
							settings[ name ] = {};
						}
						f(settings[ name ], value, keysCopy.shift(), keysCopy);
					} else {

						if ( 'undefined' == typeof settings[ name ] ) {
							settings[ name ] = [];
						}

						settings[ name ].push( value );
					}
				}
				// Standard name/value pair.
				else {
					settings[ data[ i ].name ] = value;
				}
			}

			// Update auto suggest values.
			for ( key in settings ) {

				if ( 'undefined' != typeof settings[ 'as_values_' + key ] ) {

					settings[ key ] = $.grep(
						settings[ 'as_values_' + key ].split( ',' ),
						function( n ) {
							return n !== '';
						}
					).join( ',' );

					try {
						delete settings[ 'as_values_' + key ];
					}
					catch( e ) {}
				}
			}

			// Return the settings.
			return settings;
		}
	}

	// To ensure necessary scripts are executed again when settings are changed
	$( document ).on( 'fl-builder.preview-rendered fl-builder.layout-rendered', '.fl-builder-content', function() {
		// Trigger Widgets Bundle widgets to setup
		$( sowb ).trigger( 'setup_widgets' );
	} );

})(jQuery);
