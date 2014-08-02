/* global requirejs: false, jasmine: false */
requirejs.config({
  baseUrl: '../lib',

  map: {
    '*': {
      'test': '../../test',
    }
  },

  paths: {
    'jquery': '../node_modules/jquery/dist/jquery.min'
  },

  deps: [
    'jquery'
  ],

  callback: function() {
  }
});