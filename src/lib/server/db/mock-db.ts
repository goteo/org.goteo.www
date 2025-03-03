import type { User, Session } from "./schema";

type Tables = {
  user: Map<string, User>;
  session: Map<string, Session>;
};

const tables: Tables = {
  user: new Map<string, User>(),
  session: new Map<string, Session>(),
};

// Initialize with mock user for testing
// Use a simplified hash that's easier to handle
const mockUser: User = {
  id: "test123456789abcdefgh",
  username: "testuser",
  // Hash format is modified to be more reliable across systems
  passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$c2FsdHNhbHRzYWx0c2FsdA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};
tables.user.set(mockUser.id, mockUser);
console.log("Mock user initialized with username: testuser and password: password123");

// Simple query builder to mimic Drizzle's API
export class MockQueryBuilder<T extends keyof Tables> {
  private tableName: T;
  private conditions: Array<(item: Tables[T] extends Map<string, infer U> ? U : never) => boolean> = [];
  private joinTable?: keyof Tables;
  private joinCondition?: Function;
  private selectFields?: Record<string, any>;

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  select<S>(fields?: S) {
    this.selectFields = fields || {};
    return this;
  }

  from(tableName: T) {
    this.tableName = tableName;
    return this;
  }

  where(condition: Function) {
    this.conditions.push((item) => condition(item));
    return this;
  }

  innerJoin(tableName: keyof Tables, condition: Function) {
    this.joinTable = tableName;
    this.joinCondition = condition;
    return this;
  }

  async execute() {
    const results = [];
    const items = Array.from(tables[this.tableName].values());

    // Debug
    console.log(`Executing query on ${this.tableName}, ${items.length} items found`);
    console.log(`Conditions: ${this.conditions.length}`);

    for (const item of items) {
      let include = true;
      for (const condition of this.conditions) {
        if (!condition(item)) {
          include = false;
          break;
        }
      }

      if (!include) continue;

      if (this.joinTable && this.joinCondition) {
        const joinItems = Array.from(tables[this.joinTable].values());
        const joinItem = joinItems.find((jitem) => this.joinCondition!(item, jitem));

        if (joinItem) {
          if (this.selectFields && Object.keys(this.selectFields).length > 0) {
            const result: Record<string, any> = {};
            Object.entries(this.selectFields).forEach(([key, value]) => {
              if (typeof value === "object") {
                result[key] = {};
                Object.keys(value).forEach((subKey) => {
                  result[key][subKey] = key === this.joinTable ? joinItem[subKey] : item[subKey];
                });
              } else if (key === this.tableName) {
                result[key] = item;
              } else if (key === this.joinTable) {
                result[key] = joinItem;
              }
            });
            results.push(result);
          } else {
            results.push({ [this.tableName]: item, [this.joinTable]: joinItem });
          }
        }
      } else {
        // For simple queries, return the item directly
        results.push(item);
      }
    }

    console.log(`Query returned ${results.length} results`);
    return results;
  }
}

export const eq = (field: string, value: any) => (item: any) => {
  // Debug log for troubleshooting
  console.log(`Comparing ${field}: ${item[field]} === ${value}`);
  return item[field] === value;
};

export const MockDb = {
  select: function <T>(fields: T) {
    return {
      from: (tableName: keyof Tables) => new MockQueryBuilder(tableName).select(fields),
    };
  },

  insert: function (table: keyof Tables) {
    return {
      values: async (data: any) => {
        tables[table].set(data.id, data);
        return { id: data.id };
      },
    };
  },

  update: function (table: keyof Tables) {
    return {
      set: function (updates: Partial<any>) {
        return {
          where: async (condition: Function) => {
            const items = Array.from(tables[table].values());
            for (const item of items) {
              if (condition(item)) {
                const updated = { ...item, ...updates };
                tables[table].set(item.id, updated);
              }
            }
          },
        };
      },
    };
  },

  delete: function (table: keyof Tables) {
    return {
      where: async (condition: Function) => {
        const items = Array.from(tables[table].entries());
        for (const [id, item] of items) {
          if (condition(item)) {
            tables[table].delete(id);
          }
        }
      },
    };
  },
};
