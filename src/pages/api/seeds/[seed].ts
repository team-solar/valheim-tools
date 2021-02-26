import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '../../../enums';
import { Seed } from '../../../models';
import { error } from '../../../utils';
import { getRepo } from '../lib';

const get = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { seed },
  } = req;

  if (!seed) {
    error(res, 'Missing Fields', ApiError.BAD_REQUEST, { missingFields: ['seed'] });
    return;
  }

  const seedRepo = await getRepo<Seed>(Seed);
  const data = await seedRepo.findOne({ where: { seed }, cache: 60000 });

  if (!data) {
    error(res, 'Seed does not exist', ApiError.RESOURCE_NOT_FOUND);
    return;
  }

  res.status(200).json(data);
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  switch (req.method) {
    case 'GET':
      await get(req, res);
      break;
    default:
      res.status(405).end(); // Method Not Allowed
      break;
  }
};
