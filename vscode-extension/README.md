# ATDD.TestScriptor for AL

VSCode extension for Acceptance Test-Driven Development test scriptor aka ATDD.TestScriptor V2 as follow up on [ATDD.TestScriptor](https://github.com/fluxxus-nl/ATDD.TestScriptor).

The Acceptance Test-Driven Development test scriptor allows the user to define in a managed matter ATDD test scenarios and convert it into an AL code structure to facilate fast test code development.

The ATDD pattern is defined by so called tags:

*	**FEATURE**: defines what feature(s) the test or collection of test cases is testing
*	**SCENARIO**: defines for a single test the scenario being teste
*	**GIVEN**: defines what data setup is needed; a test case can have **multiple** GIVEN tags when data setup is more complex
*	**WHEN**: defines the action under test; each test case should have **only one** WHEN tag
*	**THEN**: defines the result of the action, or more specifically the verification of the result; if multiple results apply, **multiple** THEN tags will be needed

## Features
At this point in time *ATDD.TestScriptor for AL* allows you to:
- **abstract** ATDD definitions from AL test codeunits
- **create** ATDD definitions in AL test codeunits
- **remove** ATDD definitions from AL test codeunits
- **update** ATDD definitions in AL test codeunits
## Issues
### Known Issues
As this is a _beta_ version no listing is made for known issues. Have a look at the [issues](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues) on the GitHub repository.

### Issue reporting
and of course, be more than welcome to report any issue you come accross on our [GitHub repository](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension).
## Contributors
A big thanx to [@martonsagi](https://github.com/martonsagi) and [@DavidFeldhoff](https://github.com/DavidFeldhoff) for their development power.

# Requirements overview
## A short history 
Base on the original [ATDD.TestScriptor](https://github.com/fluxxus-nl/ATDD.TestScriptor) conceived by [@lvanvugt](https://github.com/lvanvugt) and build by [@jhoek](https://github.com/orgs/fluxxus-nl/people/jhoek), [@martonsagi](https://github.com/martonsagi) did build a first UI version which is still the base to the current version. With the help of [@DavidFeldhoff](https://github.com/DavidFeldhoff) we started to, bottom up, fill in the various features that will allow you to create a new FEATURE, add SCENARIOs and detail these out with GIVEN, WHEN and THEN tags, and simulataneously generate the .al counterpart.
As [@martonsagi](https://github.com/martonsagi) could already extract from an .al test codeunit the various tags we followed the bottom up order and started with first enabling to add a new GIVEN to an existing test function, i.e. SCENARIO.
This is the path we have followed so far:
1. Use Case: **Adding Given-When-Then** [#27](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/27)
1. Use Case: **Removing Given-When-Then** [#28](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/28)
1. Use Case: **Update Given-When-Then** [#30](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/30)
1. Use Case: **Adding Scenario** [#38](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/38)
1. Use Case: **Removing Scenario** [#39](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/39)
1. Use Case: **Updating Scenario** [#60](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/60)
1. Use Case: **Adding Feature** [#61](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/61)
1. Use Case: **Removing Feature** [#62](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/62)

## Out of scope
These are the current **out of scope** use cases:
1. Use Case: **Moving Given-When-Then** [#29](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/29)
1. Use Case: **Moving Scenario** [#59](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/59)
1. Use Case: **Updating Feature** [#64](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/64)
1. Use Case: **Copying Scenario** [#65](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues/65)

Next to that exporting to and importing from Excel of ATDD features/sceanrios is not yet handled.

**Enjoy!**