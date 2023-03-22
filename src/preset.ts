export function webpackFinal(config: any) {
  config.module.rules = [
    {
      oneOf: [
        {
          resourceQuery: /raw$/,
          use: 'raw-loader',
        },
        // Nest default rules so "raw" resource query has priority.
        {
          rules: config.module.rules,
        },
      ],
    },
  ];

  return config;
}
