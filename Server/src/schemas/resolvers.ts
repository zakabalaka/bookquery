import { User, BookDocument } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface loginArgs {
    email: string;
    password: string;
}

interface AddUserArgs {
    input:{
        username: string;
        email: string;
        password: string;
    }
}

interface SaveBookArgs {
    book: BookDocument;
}

interface RemoveBookArgs {
    bookId: string;
}

interface Context {
    user?: typeof User.prototype;
}

const resolvers = {
    Query: {
        me: async (_parent: unknown, _args: unknown, context: Context): Promise< typeof User.prototype | null> => {
            if (context.user) {
                return await User.findOne({_id: context.user._id }).populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        login: async (_parent: unknown, { email, password }: loginArgs): Promise<{ token: string; user: typeof User.prototype }> => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user.username, user.email, user._id);

            return { token, user };
        },

        addUser: async (_parent: unknown, { input }: AddUserArgs): Promise<{ token: string; user: typeof User.prototype }> => {
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        saveBook: async (_parent: any, { book }: SaveBookArgs, context: Context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true, runValidators: true }
                ).populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async (_parent: unknown, { bookId }: RemoveBookArgs, context: Context): Promise< typeof User.prototype | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }

            throw new AuthenticationError('Could not find user');
        }
    }
};

export default resolvers;