/**
  @fileoverview main Grunt task file
  **/
  'use strict';

  var fs = require("fs")
  , path = require("path");

  module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')

    });

    grunt.loadNpmTasks("grunt-dust");
    grunt.loadNpmTasks('grunt-contrib-watch');

   // Default task(s).
   grunt.registerTask('default', ['dust']);
 };
