# ATDD.TestScriptor for AL

VSCode extension for Acceptance Test-Driven Development test scriptor aka ATDD.TestScriptor V2 as follow up on [ATDD.TestScriptor](https://github.com/fluxxus-nl/ATDD.TestScriptor).

The Acceptance Test-Driven Development test scriptor allows the user to define in a managed matter ATDD test scenarios and convert them into an AL code structure to facilate fast test code development.

## ATDD Tags
The ATDD pattern is defined by so called tags:

*	**FEATURE**: defines what feature(s) the test or collection of test cases is testing
*	**SCENARIO**: defines for a single test the scenario being tested
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
As this is a _beta_ version no specific listing is made for known issues. Have a look at the beta related [issues](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues?q=is%3Aopen+is%3Aissue+milestone%3A%22beta+release%22) on the GitHub repository.

#### Note
One known issue, however, makes sense to be noted: multi-project workspaces are not yet fully supported, meaning that some things work well, while others might not.

### Issue reporting
Be more than welcome to report any issue you come accross on our [GitHub repository](https://github.com/fluxxus-nl/ATDD.TestScriptor.VSCodeExtension/issues).
## Contributors
A big thanx to [@martonsagi](https://github.com/martonsagi) and [@davidfeldhoff](https://github.com/davidfeldhoff) for their development power. And [@stefanmaron](https://github.com/stefanmaron) for his early stage testing.

# Requirements overview
## A brief history 
Based on the original [ATDD.TestScriptor](https://github.com/fluxxus-nl/ATDD.TestScriptor) conceived by [@lvanvugt](https://github.com/lvanvugt) and build by [@jhoek](https://github.com/orgs/fluxxus-nl/people/jhoek), [@martonsagi](https://github.com/martonsagi) did build a first UI version which is still the base to the current version. With the help of [@davidfeldhoff](https://github.com/davidfeldhoff) we started to, bottom up, fill in the various features that will allow you to create a new FEATURE, add SCENARIOs and detail these out with GIVEN, WHEN and THEN tags, and simulataneously generate the .al counterpart.
As [@martonsagi](https://github.com/martonsagi) could already extract from an .al test codeunit the various tags we followed the bottom up order and started with first enabling to add a new GIVEN to an existing test function, i.e. SCENARIO.

## Scope
This is the path we have followed so far and defines the scope of the _beta_ release:

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

Next to that exporting to and importing from Excel of ATDD features/scenarios is not yet handled.

# Opening ATDD.TestScriptor
To open the TestScriptor page type `ATDD.TestScriptor` in the command pallette and press enter. When the page opens the extension determines whether...

- your VSCode project contains AL test codeunits, i.e. codeunit objects with `Subtype = Test`
- each test codeunit contains a **FEATURE** and **SCENARIO**s

As a result the TestScriptor page displays each FEATURE/SCENARIO combination as a line enabling you with a hyperlinked scenario name to jump to the related AL test function.

![Opening ATDD.TestScriptor](media/Opening%20ATDD.TestScriptor.gif)

In case a test codeunit does not contain a **FEATURE** tag the FEATURE column in the TestScriptor page remains empty. If no  **SCENARIO** tag has been provided for a test function the test function name will be used.
### Tip
To get the FEATURE column in the TestScriptor page populated add a **FEATURE** tag the test codeunit. See also **Abstracting ATDD information**.
# Basic Rules
## Abstracting ATDD information
To be able to abstract ATDD information from a test codeunit the following rules apply.

- Each ATDD tag is provided as a comment line with a square bracketed tag with a description
- The **FEATURE** tag resides in the OnRun trigger or somewhere in the top of the test codeunit, before the OnRun trigger or any function. And/or as a comment line right under the test function name
- A **SCENARIO** tag resides either as a comment line in the test function or right under the test function name; as already mentioned, if a SCENARIO tag is missing the test function name will be used a SCENARIO description
- A **SCENARIO** tag can be accompanied by a number in one of the formats `#x1`, `x1` or `1`, with x a number of leading zeros and 1 any number
- Each **SCENARIO** only contains one **WHEN**

## Converting ATDD information
When entering ATDD information in the TestScriptor page the following rules apply.

- A new **FEATURE** tag results in a new test codeunit with the same name; the new test codeunit will be placed in the folder defined in the ``atddTestScriptor`` setting ``testDirectory``
- A new **SCENARIO** tag results in a new test function with the same name where
  - spaces are removed
  - each single word is capatalized
  - all non-alphabetic and non-numeral characters are removed
  - a call to the ``Intialize`` helper function is added to
- A new **GIVEN**, **WHEN** or **THEN** tag results in a call to a helper function with the same name where
  - the same name creation rules apply as for SCENARIO
  - the name is preceded with the prefix as defined in the ``atddTestScriptor`` settings
    - ``prefixGiven`` (default: ``Create``)
    - ``prefixWhen`` (default: none)
    - ``prefixThen`` (default: ``Make``)
  - it will by default contain a _Not yet implemented_ error statement including the name of the helper function; you can change this by changing the ``atddTestScriptor`` setting ``addException`` to ``false``
- The maximum length of the name of the functions created for the **SCENARIO**, **GIVEN**, **WHEN** and **THEN** tags is controled by the ``atddTestScriptor`` setting ``maxLengthOfDescription``. Its default value is ``120``

![Converting ATDD information](media/Converting%20ATDD%20information.gif)

## Removing  ATDD information
When removing ATDD information ATDD.TestScriptor will ask you in various cases to confirm your changes. You can change this behaviour by means of the ``atddTestScriptor`` setting ``removalMode``.
- _Ask for confirmation_ (default)
- _No confirmation, but removal_
- _No confirmation & no removal_

# Background and Examples
If you are looking for inspiration on ATDD based testing, you might want to consults these resource:
- the [Acceptance test–driven development](https://en.wikipedia.org/wiki/Acceptance_test%E2%80%93driven_development) wiki topic
- the [Automated Testing in Microsoft Dynamics 365 Business Central](https://www.packtpub.com/product/automated-testing-in-microsoft-dynamics-365-business-central/9781789804935) book
- the [Test Automation Examples](https://github.com/fluxxus-nl/Test-Automation-Examples) GitHub repo
- the zillion tests that Microsoft delivers with Dynamics 365 Business Central

**Have fun!**
