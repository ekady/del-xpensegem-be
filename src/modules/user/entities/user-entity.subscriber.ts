import type {
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';

import HashHelper from '@/shared/helpers/hash.helper';

import { UserEntity } from './user.entity';

@EventSubscriber()
export class UserEntitySubscriber
  implements EntitySubscriberInterface<UserEntity>
{
  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>): Promise<void> {
    if (event.entity.password) {
      event.entity.password = await HashHelper.encrypt(event.entity.password);
      event.entity.passwordConfirm = null;
      event.entity.passwordChangedAt = new Date(Date.now());
    }
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
    if (event.entity.password) {
      event.entity.password = await HashHelper.encrypt(event.entity.password);
      event.entity.passwordConfirm = null;
      event.entity.passwordChangedAt = new Date(Date.now());
    }
  }
}
