// vite.config.mjs
import { defineConfig, loadEnv } from "file:///F:/Crunchy%20Cookies%20-%20Ecommerce%20Store/dashboard/node_modules/vite/dist/node/index.js";
import react from "file:///F:/Crunchy%20Cookies%20-%20Ecommerce%20Store/dashboard/node_modules/@vitejs/plugin-react/dist/index.js";
import tsconfigPaths from "file:///F:/Crunchy%20Cookies%20-%20Ecommerce%20Store/dashboard/node_modules/vite-tsconfig-paths/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "F:\\Crunchy Cookies - Ecommerce Store\\dashboard";
var resolvePath = (str) => path.resolve(__vite_injected_original_dirname, str);
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3e3;
  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: "window"
    },
    resolve: {
      alias: [
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // }
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false
        },
        less: {
          charset: false
        }
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        input: {
          main: resolvePath("index.html"),
          legacy: resolvePath("index.html")
        }
      }
    },
    base: API_URL,
    plugins: [react(), tsconfigPaths()]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcQ3J1bmNoeSBDb29raWVzIC0gRWNvbW1lcmNlIFN0b3JlXFxcXGRhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcQ3J1bmNoeSBDb29raWVzIC0gRWNvbW1lcmNlIFN0b3JlXFxcXGRhc2hib2FyZFxcXFx2aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L0NydW5jaHklMjBDb29raWVzJTIwLSUyMEVjb21tZXJjZSUyMFN0b3JlL2Rhc2hib2FyZC92aXRlLmNvbmZpZy5tanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5jb25zdCByZXNvbHZlUGF0aCA9IChzdHIpID0+IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHN0cik7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIGNvbnN0IEFQSV9VUkwgPSBgJHtlbnYuVklURV9BUFBfQkFTRV9OQU1FfWA7XG4gIGNvbnN0IFBPUlQgPSAzMDAwO1xuXG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICAvLyB0aGlzIGVuc3VyZXMgdGhhdCB0aGUgYnJvd3NlciBvcGVucyB1cG9uIHNlcnZlciBzdGFydFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIC8vIHRoaXMgc2V0cyBhIGRlZmF1bHQgcG9ydCB0byAzMDAwXG4gICAgICBwb3J0OiBQT1JULFxuICAgICAgaG9zdDogdHJ1ZVxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIGhvc3Q6IHRydWVcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgZ2xvYmFsOiAnd2luZG93J1xuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IFtcbiAgICAgICAgLy8geyBmaW5kOiAnJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgZmluZDogL15+KC4rKS8sXG4gICAgICAgIC8vICAgcmVwbGFjZW1lbnQ6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzLyQxJylcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgIGZpbmQ6IC9ec3JjKC4rKS8sXG4gICAgICAgIC8vICAgcmVwbGFjZW1lbnQ6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnc3JjLyQxJylcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgZmluZDogJ2Fzc2V0cycsXG4gICAgICAgIC8vICAgcmVwbGFjZW1lbnQ6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cycpXG4gICAgICAgIC8vIH0sXG4gICAgICBdXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGNoYXJzZXQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBjaGFyc2V0OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2hhcnNldDogZmFsc2UsXG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwb3N0Y3NzUGx1Z2luOiAnaW50ZXJuYWw6Y2hhcnNldC1yZW1vdmFsJyxcbiAgICAgICAgICAgIEF0UnVsZToge1xuICAgICAgICAgICAgICBjaGFyc2V0OiAoYXRSdWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGF0UnVsZS5uYW1lID09PSAnY2hhcnNldCcpIHtcbiAgICAgICAgICAgICAgICAgIGF0UnVsZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDE2MDAsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgbWFpbjogcmVzb2x2ZVBhdGgoJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgICBsZWdhY3k6IHJlc29sdmVQYXRoKCdpbmRleC5odG1sJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYmFzZTogQVBJX1VSTCxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdHNjb25maWdQYXRocygpXVxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRVLFNBQVMsY0FBYyxlQUFlO0FBQ2xYLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUUxQixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxjQUFjLENBQUMsUUFBUSxLQUFLLFFBQVEsa0NBQVcsR0FBRztBQUV4RCxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxVQUFVLEdBQUcsSUFBSSxrQkFBa0I7QUFDekMsUUFBTSxPQUFPO0FBRWIsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBO0FBQUEsTUFFTixNQUFNO0FBQUE7QUFBQSxNQUVOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BY1A7QUFBQSxJQUNGO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixTQUFTO0FBQUEsUUFDWDtBQUFBLFFBQ0EsTUFBTTtBQUFBLFVBQ0osU0FBUztBQUFBLFFBQ1g7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsZUFBZTtBQUFBLFlBQ2YsUUFBUTtBQUFBLGNBQ04sU0FBUyxDQUFDLFdBQVc7QUFDbkIsb0JBQUksT0FBTyxTQUFTLFdBQVc7QUFDN0IseUJBQU8sT0FBTztBQUFBLGdCQUNoQjtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0wsTUFBTSxZQUFZLFlBQVk7QUFBQSxVQUM5QixRQUFRLFlBQVksWUFBWTtBQUFBLFFBQ2xDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO0FBQUEsRUFDcEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
