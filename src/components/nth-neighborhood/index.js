"use strict";

import FastSet from 'collections/fast-set';
import parallel from 'async/parallel';

var nth_neighborhood = function( api, transform, d3, config ) {


    var slug = "statements";
    var n = 2;
    /**
     * Contains the set of slugs of channels that have been roots in the get_channel routine.
     *
     */
    var roots = new FastSet();

    function get_root( root, n, callback ) {
        get_channel(
            root,
            n,
            {root: {slug: root, channel: {}}},
            callback
        );
    }

    var channel_rep = { slug: "", channel: {} };
    var block_rep = { id: 0, block: {}, channels: [ channel_rep ]};

    var data_rep = {
        root: {slug: "", channel:{}},
        blocks: [ block_rep ],
        channels: [ channel_rep ]
    };



    function get_channel( local_root, k, final_result, callback ) {

        if ( k === 0 ) {
            console.log('in [get_channel]: distance k = n = '+ n +' reached.');

            callback( final_result );

        } else if ( roots.has( local_root ) ) {
            console.log('in [get_channel]: local root \"'+ local_root +'\" in collection.');

            callback( final_result );

        } else {
            /** console.log('in [get_channel]: distance k = '+ (n - k) +' reached.'); */

            parallel({
                root: function( next ) {
                    api .channel( local_root )
                        .then( function( response ) { next(null, response.data); } )
                    //    .catch( function( error ) { next( error ); } );
                },
                channels: function( next ) {
                    api .channel( local_root, 'channels' )
                        .then( function( response ) { next(null, response.data); } )
                        //.catch( function( error ) { next( error ); } );
                }
            },
            function(err, results) {
                if ( err ) { console.error( err ); }
                console.log( results );

                /** 1. Add the local root to the set of visited nodes */
                roots.add( local_root );

                /** 2. Update channels in final result, resolve blocks between channel and local_root */


                /** 3. recursive step. */
                results.channels.channels.forEach( function( channel_object ) {
                    console.log('in [get_channel]: recursive call k = '+ (n - k) + ' for: \"'+ channel_object.channel.slug +'\".');
                    get_channel( channel_object.channel.slug, k - 1, final_result, callback );
                })


            });

        }

    }

    function get_shared_blocks( ch_A, ch_B ) {

    }


    get_root( slug, n, function( result ) { console.log( 'in [callback]: done.' ); console.log( result ); });

};




export { nth_neighborhood };
