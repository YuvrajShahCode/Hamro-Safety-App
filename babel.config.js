// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       "nativewind/babel",
//       "react-native-reanimated/plugin", // must remain last
//     ],
//   };
// };

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "react-native-worklets/plugin", // Reanimated v4 moved the plugin here — must remain last
    ],
  };
};