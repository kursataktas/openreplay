interface User {
  id: string;
  name: string;
}

interface ICustomEvent {
  id: string;
  name: string;
  user: User;
  created_at: Date;
}

export default class CustomEvent implements ICustomEvent {
  id: string;
  name: string;
  user: User;
  created_at: Date;

  constructor(id: string, name: string, user: User, created_at: Date) {
    this.id = id;
    this.name = name;
    this.user = user;
    this.created_at = created_at;
  }

  static fromJson(json: any): CustomEvent {
    return new CustomEvent(
      json.id,
      json.name,
      {
        id: json.user?.id,
        name: json.user?.name
      },
      new Date(json.created_at)
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      user: {
        id: this.user.id,
        name: this.user.name
      },
      created_at: this.created_at.toISOString()
    };
  }
}
