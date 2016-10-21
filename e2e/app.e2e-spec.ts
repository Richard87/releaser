import { ReleaserPage } from './app.po';

describe('releaser App', function() {
  let page: ReleaserPage;

  beforeEach(() => {
    page = new ReleaserPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
