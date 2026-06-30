## Requirements

This project should be a set of templates for use to simplify all future projects.

It must support:

- Front end development, with a pluggable approach meaning that when the template is updated, minimal changes are needed to consuming applications
- API development wrappers, supporting swagger and documentation
- Full authentication providers support throughout the stack, with role support, using OIDC and examples with Keyclock
- Full Docker support with examples and complete compose test stacks
- Full unit tests where appropriate 
- Packaged for easy consumption and updates - Packages will be published to external Proget feeds
- Have github workflows for building, testing, and publishing
- Consume the free template from https://github.com/themeselection/materio-bootstrap-html-aspnet-core-mvc-admin-template-free for the MVC frontend to make it look good.
- Be agnostic on the database expectation, even to the point of defaulting to sqllite where possible. Otherwise default to postgres / mysql.

## Components

- .NET 10
- Latest Angular

.NET MVC Front End
Angular Front End (for when an SPA is needed), MVC is prefered instead
API Layer

## Key instructions

- Build using best practices
- Lookup latest practices where required
- Ensure code is tested where appropriate
- Ensure code is commented where appropriate
- Ensure documentation is generated where appropriate

## Projects to read and refer to

/home/andy/git/aneillans/aims
/home/andy/git/aneillans/ecards
/home/andy/git/aneillans/mail-verifier
/home/andy/git/aneillans/twitch-tools
