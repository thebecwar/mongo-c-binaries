libmongoc-bin
-------------

This package provides an install hook that downloads a pre-compiled version of the mongo-c-driver. The version of this package corresponds to the released version of the mongo driver. (Currently 1.14.0) The package also includes a .gypi file that should, hopefully, make using this library from native extensions easier.

The source for this NPM package (and just the package) is licensed under beerware. The license for libmongoc carries its own terms, and isn't affected by this distribution method. You should review the library's license terms to make sure you are compliant. (Like whether you are obligated to provide the source code, and carry forward additional information into your documentation.) 

In other words, be a good person, and make sure that the people who worked hard on the driver get the credit for their work.

If you want to use this approach to provide other native code dependencies to node, and make cross-platform native extensions easier, be my guest. I'd love to hear from anyone crazy enough to try this.
