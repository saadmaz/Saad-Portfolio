# Migration Checklist - Component by Component

Use this checklist to migrate your existing components to the new data structure.

## 📋 General Sections

### Blog Section
- [ ] Update `BlogPage.tsx` to use `useBlogs()`
- [ ] Update `BlogsPage.tsx` to use `useBlogs()`
- [ ] Update `BlogDetailPage.tsx` to fetch by slug
- [ ] Remove old blog data imports
- [ ] Test blog list shows latest first
- [ ] Test blog detail page works
- [ ] Test loading states

### Projects Section
- [ ] Update `ProjectsPage.tsx` to use `useProjects()`
- [ ] Update featured projects to use `useFeaturedProjects()`
- [ ] Remove old project data imports
- [ ] Test featured projects show first
- [ ] Test all projects display
- [ ] Test featured filter works
- [ ] Test sorting (latest first)

### Experience Section
- [ ] Update `ExperiencePage.tsx` to use `useWorkExperience()`
- [ ] Remove old experience data imports
- [ ] Test experience shows latest first
- [ ] Test all fields display correctly
- [ ] Test timeline displays in order

### Skills Section
- [ ] Update `SkillsPage.tsx` to use `useSkills()`
- [ ] Update skill components to use category structure
- [ ] Remove old skill data imports
- [ ] Test skills grouped by category
- [ ] Test skill levels display
- [ ] Test years of experience show

### Events Section
- [ ] Create `EventsPage.tsx` using `useEvents()`
- [ ] Update `EventDetailPage.tsx` if exists
- [ ] Test events show latest first
- [ ] Test event filtering by type
- [ ] Test images load correctly

### Certificates Section
- [ ] Update certificate display to use `useCertificates()`
- [ ] Remove old certificate imports
- [ ] Test certificates show latest first
- [ ] Test credential links work
- [ ] Test expiry dates display

### Newsletter Section
- [ ] Update `NewslettersPage.tsx` to use `useNewsletters()`
- [ ] Split founder and CSE newsletters
- [ ] Use `useNewslettersByType()` for filtering
- [ ] Remove old newsletter imports
- [ ] Test founder newsletters show
- [ ] Test CSE newsletters show
- [ ] Test separation works correctly

### Hosting Section
- [ ] Create hosting display component
- [ ] Use `useActiveHosting()` for active services
- [ ] Use `useHosting()` for all services
- [ ] Test active filter works
- [ ] Test platform badges display
- [ ] Test technology tags show

## 🏠 Home/Index Page
- [ ] Update featured projects section
- [ ] Update featured blogs section
- [ ] Update hero section with latest data
- [ ] Update statistics (total projects, blogs, etc)
- [ ] Test all sections load
- [ ] Test loading states

## 👤 About/Profile Pages
- [ ] Keep education data (still uses old structure)
- [ ] Update with any other portfolio data
- [ ] Test profile displays correctly
- [ ] Test education section works

## 🧩 Reusable Components
- [ ] `BlogCard.tsx` - Ensure takes blog prop correctly
- [ ] `ProjectCard.tsx` - Ensure takes project prop correctly
- [ ] `ExperienceCard.tsx` - Ensure takes experience prop correctly
- [ ] Any timeline components - Test sorting
- [ ] Any card list components - Test latest first

## 🎨 Layout Components
- [ ] `Header.tsx` - Check all navigation links work
- [ ] `Footer.tsx` - Check footer data displays
- [ ] `Layout.tsx` - Test layout wraps components
- [ ] Navigation - Test all routes accessible

## 🔧 Header/Navigation
- [ ] Update navigation links (if needed)
- [ ] Test all routes work
- [ ] Test active link highlighting
- [ ] Test mobile navigation

## 📱 Responsive Pages
- [ ] Test BlogsPage on mobile
- [ ] Test ProjectsPage on mobile
- [ ] Test ExperiencePage on mobile
- [ ] Test SkillsPage on mobile
- [ ] Test EventsPage on mobile
- [ ] Test all pages scroll correctly

## 🧪 Testing
- [ ] Load pages in browser
- [ ] Check console for errors
- [ ] Check data loads with loading state
- [ ] Check latest data appears first
- [ ] Check all fields display
- [ ] Check images load
- [ ] Check links work
- [ ] Check responsive layout
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop

## 🚀 Performance
- [ ] Check no unused imports
- [ ] Check bundle size unchanged
- [ ] Check page load time
- [ ] Check no console warnings
- [ ] Check no memory leaks

## 📝 Code Quality
- [ ] Remove all old data imports
- [ ] Remove old data files (backup first!)
- [ ] Check for unused variables
- [ ] Check code follows patterns in examples
- [ ] Add TypeScript types where needed
- [ ] Add JSDoc comments for complex logic

## 📚 Documentation
- [ ] Update component README if exists
- [ ] Update Storybook stories if used
- [ ] Document any custom hooks created
- [ ] Add comments to complex components

## 🐛 Bug Fixes
- [ ] Fix sorting issues (if any)
- [ ] Fix loading state issues (if any)
- [ ] Fix missing data (if any)
- [ ] Fix type errors (if any)
- [ ] Fix styling issues (if any)

## ✅ Final Checks

### Before Going Live
- [ ] All pages load without errors
- [ ] All data displays correctly
- [ ] Latest data appears first
- [ ] All links work
- [ ] All images load
- [ ] Responsive on all devices
- [ ] No console errors
- [ ] No console warnings
- [ ] Bundle size acceptable
- [ ] Performance acceptable

### Data Verification
- [ ] All blogs have correct fields
- [ ] All projects have correct fields
- [ ] All experience entries have correct fields
- [ ] All skills grouped correctly
- [ ] All events have correct fields
- [ ] All certificates have correct fields
- [ ] All newsletters properly typed
- [ ] All hosting info correct

### Deployment
- [ ] Build succeeds: `npm run build`
- [ ] No build warnings
- [ ] All tests pass (if applicable)
- [ ] Staging deployment works
- [ ] Production deployment ready

## 📊 Component Migration Status

Use this table to track progress:

| Component | Status | Notes |
|-----------|--------|-------|
| BlogsPage | ⬜ Not Started | |
| ProjectsPage | ⬜ Not Started | |
| ExperiencePage | ⬜ Not Started | |
| SkillsPage | ⬜ Not Started | |
| EventsPage | ⬜ Not Started | |
| CertificatesSection | ⬜ Not Started | |
| NewslettersPage | ⬜ Not Started | |
| HomePage/Index | ⬜ Not Started | |
| Header | ⬜ Not Started | |
| Footer | ⬜ Not Started | |

Legend:
- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ⚠️ Issues/Needs Review

## 🎯 Quick Win Components (Start Here)

These components are easiest to migrate:

1. **ProjectsPage** - Simple iteration over projects array
2. **EventsPage** - Simple iteration over events array
3. **BlogsPage** - Simple iteration over blogs array
4. **SkillsPage** - Iterate over categories and skills

## 🔐 Tricky Components (Need Care)

These components need extra attention:

1. **BlogDetailPage** - Need to fetch by slug
2. **Newsletter filtering** - Need to split by type
3. **Responsive behavior** - Test on all devices
4. **Featured projects** - Make sure featured filter works

## 💡 Tips

✅ **Start small** - Pick one component and migrate it completely
✅ **Test thoroughly** - Check data displays correctly
✅ **Keep backups** - Before removing old data
✅ **Use examples** - Copy patterns from DataStructureExamples.tsx
✅ **TypeScript first** - Use types to catch errors
✅ **Console logs** - Check data structure while debugging
✅ **One page at a time** - Don't migrate everything at once

## 🚨 Common Issues

**Issue: Data not updating**
→ Check component uses hook correctly
→ Check JSON file syntax
→ Clear browser cache
→ Restart dev server

**Issue: Wrong sort order**
→ Check date format (must be YYYY-MM-DD)
→ Check dataManager.ts sorting logic
→ Log data to console to verify

**Issue: Loading state stuck**
→ Check hook implementation
→ Check no console errors
→ Test manual data access with dataManager

**Issue: Type errors**
→ Import types from dataManager
→ Check required fields in JSON
→ Update component to match interface

**Issue: Images not loading**
→ Check image paths are correct
→ Check image files exist
→ Use absolute paths starting with `/`

---

## 📞 Need Help?

- 📖 See [DATA_STRUCTURE_GUIDE.md](DATA_STRUCTURE_GUIDE.md) for complete reference
- ⚡ See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick lookup
- 🔗 See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for integration steps
- 📋 See [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) for visual guide
- 💡 See [src/components/examples/DataStructureExamples.tsx](src/components/examples/DataStructureExamples.tsx) for code examples

---

**Progress Tracking:**
- [ ] Phase 1: Simple components migrated
- [ ] Phase 2: Complex components migrated
- [ ] Phase 3: Testing complete
- [ ] Phase 4: Performance verified
- [ ] Phase 5: Ready for production
