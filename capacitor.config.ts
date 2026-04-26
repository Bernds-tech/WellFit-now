import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.wellfit.mobile",
  appName: "WellFit",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
