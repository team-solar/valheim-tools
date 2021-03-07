import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { InitOptions } from 'next-auth';
import Adapters from 'next-auth/adapters';
import Providers from 'next-auth/providers';
import { Role } from '../../../enums';
import { Session } from '../../../types';
import { AuthService } from '../lib/services';

const options: InitOptions = {
  // full list of providers can be found https://next-auth.js.org/configuration/providers
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Providers.Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Providers.Twitch({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
    }),
  ],
  adapter: Adapters.TypeORM.Adapter({
    type: 'mysql',
    host: String(process.env.AUTH_DB_HOST ?? '127.0.0.1'),
    port: Number(process.env.AUTH_DB_PORT ?? 3306),
    username: String(process.env.AUTH_DB_USERNAME),
    password: String(process.env.AUTH_DB_PASSWORD),
    database: String(process.env.AUTH_DB_NAME),
    synchronize: Boolean(process.env.AUTH_DB_SYNCHRONIZE ?? false),
    name: 'auth',
  }),
  events: {
    signIn: async ({ user: { id, name } }) => AuthService.instance.save({ id, name }),
  },
  callbacks: {
    session: async (sessionData, { id }: { [key: string]: string | number }) => {
      if (!id) {
        throw new Error('Error whilst getting session - no id present');
      }

      const session = sessionData as Session;
      session.user.id = id;

      const authUser = await AuthService.instance.find(id);
      session.user.role = authUser?.role ?? Role.USER;

      return session;
    },
  },
};

export default (req: NextApiRequest, res: NextApiResponse): unknown => NextAuth(req, res, options);
