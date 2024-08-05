import { Main, Scripts, Title, Links } from 'ice';

export default function Document() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <link rel="shortcut icon" href={"https://img.alicdn.com/imgextra/i1/O1CN01xz4V981kvGF9imUyH_!!6000000004745-2-tps-64-64.png"} />
        <Links />
      </head>
      <body>
        <Main />
        <Scripts />
      </body>
    </html>
  );
}
