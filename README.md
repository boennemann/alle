# alle

> monorepo publishing

I've been discussing with @nolanlawson about the [PouchDB](https://pouchdb.com/) project moving to a monorepo architecture and the pain points they're having with it.

This repository showcases a structure that addresses these problems.

However: **This is dream code**, or README driven development, in where this repo doesn't contain an implementation of these ideas – it's just a demo project structure and this README explaining how things **could** work.

## the pain points

1. linking packages is a separate step (that takes time)
2. links are a hack `module.exports = require('./path/to/the-actual-thing')`
3. incompatibility with [Greenkeeper](https://greenkeeper.io/)
4. maintaining dependencies that more than one package depends on (see also 5)
5. duplicated metadata in package.json

## possible solutions

### make use of how `require` works

Instead of storing the individual packages in a "packages" folder they're stored in a ["packages/node_modules"](packages/node_modules) folder. Because of the way the require algorithm treats a folder called "node_modules" everything inside it is now available with a simple require call from all others (1, 2).

It's a bit tedious that this requires an extra folder level, but this alone makes the entire linking step unnecessary. In the GitHub UI it's not even that bad, because it automatically points you right to the inner folder.

Scoped packages need to be stored in "packages/node_modules/@\<scope\>/".

### define dependencies globally

Both dependencies and devDependencies are only ever defined in the top-level package.json file. `npm install` is only ever run on the top-level.
As soon as a package wants to make use of an external dependencies it is added to the top-level pakage.json.

The individual packages can still just require dependencies with a simple call, because requires traverses up to the top-level node_modules folder.

Packages can no longer depend on different versions of the same dependency (4). Updating a dependency that multiple packages depend on requires a single change (4). This makes it compatible with Greenkeeper again (3).

### write individual package.json content right before publishing

The only values the package.json files of the individual packages need to have are "name" and "version".
Right before publishing these files are extended with the top-level package.json removing any need to duplicate information such as author, homepage, bugs, repository etc (5).
Because the package.json is extended it is still possible to define additional per package metadata, such as the description.

#### source code analysis to find dependencies

The dependencies object is the only value that gets special treatment. The publishing tool analyzes the source code of the individual packages (starting at their entry point), looking for all require calls, or import statements. Every required/imported npm package that's from the same repository will be defined with the latest version (that might be about to be published). All others will be defined with the version that is found in the top-level package.json. If there are required packages that aren't in the top-level package.json the tool aborts the entire publishing process (4).

#### alternative to find/define dependencies

As the process described in the previous paragraph could lead to a rather complex first implementation and could feel rather _magic_, here is an alternative:

The individual packages define their dependencies in the package.json only ever using a "\*". Before publishing these stars get overwritten by the latest version from the same repo, or the version found in the top-level package.json.

This would not require source code analysis, but some duplicated entries in the package.json files. This could however be dangerous when the package contains a require call to a package that is not defined in its package.json. It would work inside the monorepo, but not after being published.

## why is this just a README?

These are simply the ideas I had after discussing with @nolanlawson and I think it could be worth exploring them.
However I'm not running a monorepo project myself, which wouldn't make me the ideal author/maintainer for such a tool.
There are already monorepo publishing tools out there, such as [lerna](https://lernajs.io/). If they think there are cool ideas in here I'd be happy to see them being adopted – without the need for another tool. If they aren't interested I'm happy for anyone else who wants to take a shot at implementing this. Also I'm happy to learn why these might not even be good ideas in the first place.

This is meant as a starting point for a discussion and hopefully even more and better ideas.
