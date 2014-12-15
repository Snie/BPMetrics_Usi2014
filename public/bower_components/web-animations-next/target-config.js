(function() {

  var scopeSrc = [
      'src/scope.js'];

  var minifillSrc = [
      'src/animation-node.js',
      'src/effect.js',
      'src/property-interpolation.js',
      'src/animation.js',
      'src/apply-preserving-inline-style.js',
      'src/element-animatable.js',
      'src/interpolation.js',
      'src/matrix-interpolation.js',
      'src/player.js',
      'src/tick.js',
      'src/matrix-decomposition.js',
      'src/handler-utils.js',
      'src/shadow-handler.js',
      'src/number-handler.js',
      'src/visibility-handler.js',
      'src/color-handler.js',
      'src/dimension-handler.js',
      'src/box-handler.js',
      'src/transform-handler.js',
      'src/font-weight-handler.js',
      'src/position-handler.js',
      'src/shape-handler.js',
      'src/property-names.js',
      'src/deprecation.js',
  ];

  var liteMinifillSrc = [
      'src/animation-node.js',
      'src/effect.js',
      'src/property-interpolation.js',
      'src/animation.js',
      'src/apply.js',
      'src/element-animatable.js',
      'src/interpolation.js',
      'src/player.js',
      'src/tick.js',
      'src/handler-utils.js',
      'src/shadow-handler.js',
      'src/number-handler.js',
      'src/visibility-handler.js',
      'src/color-handler.js',
      'src/dimension-handler.js',
      'src/box-handler.js',
      'src/transform-handler.js',
      'src/property-names.js',
      'src/deprecation.js',
  ];


  var sharedSrc = [
      'src/timing-utilities.js',
      'src/normalize-keyframes.js'];

  var maxifillSrc = [
      'src/timeline.js',
      'src/maxifill-player.js',
      'src/animation-constructor.js',
      'src/effect-callback.js',
      'src/group-constructors.js'];

  var minifillTest = [
      'database/js/animation-node.js',
      'database/js/apply-preserving-inline-style.js',
      'database/js/box-handler.js',
      'database/js/color-handler.js',
      'database/js/dimension-handler.js',
      'database/js/effect.js',
      'database/js/interpolation.js',
      'database/js/matrix-interpolation.js',
      'database/js/number-handler.js',
      'database/js/player.js',
      'database/js/player-finish-event.js',
      'database/js/property-interpolation.js',
      'database/js/tick.js',
      'database/js/timing.js',
      'database/js/transform-handler.js'];

  var maxifillTest = minifillTest.concat(
      'database/js/animation-constructor.js',
      'database/js/effect-callback.js',
      'database/js/group-constructors.js',
      'database/js/group-player.js',
      'database/js/group-player-finish-event.js',
      'database/js/timeline.js');

  // This object specifies the source and database files for different Web Animation build targets.
  var targetConfig = {
    'web-animations': {
      scopeSrc: scopeSrc,
      sharedSrc: sharedSrc,
      minifillSrc: minifillSrc,
      maxifillSrc: [],
      src: scopeSrc.concat(sharedSrc).concat(minifillSrc),
      test: minifillTest,
    },
    'web-animations-next': {
      scopeSrc: scopeSrc,
      sharedSrc: sharedSrc,
      minifillSrc: minifillSrc,
      maxifillSrc: maxifillSrc,
      src: scopeSrc.concat(sharedSrc).concat(minifillSrc).concat(maxifillSrc),
      test: maxifillTest,
    },
    'web-animations-next-lite': {
      scopeSrc: scopeSrc,
      sharedSrc: sharedSrc,
      minifillSrc: liteMinifillSrc,
      maxifillSrc: maxifillSrc,
      src: scopeSrc.concat(sharedSrc).concat(liteMinifillSrc).concat(maxifillSrc),
      test: [],
    },
  };

  if (typeof module != 'undefined')
    module.exports = targetConfig;
  else
    window.webAnimationsTargetConfig = targetConfig;
})();
